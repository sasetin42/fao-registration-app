import axios from 'axios';
import * as supabase from './firebase.js';
import { generateVisitorCode, generateAttendanceKey } from './codegen.js';
import { broadcastToAdmins } from '../routes/registration.js';

let activeSyncPromise = null;

/**
 * Fetches registrations from the online API and synchronizes them with Firestore database.
 * @returns {Promise<number>} Number of synchronized registrations.
 */
export async function syncOnlineRegistrations() {
  if (activeSyncPromise !== null) {
    return activeSyncPromise;
  }

  activeSyncPromise = (async () => {
    try {
      const response = await axios.get('https://api-tiny-comet-wjk.ptscph.com/api/v1/all-registrations?mode=online');
      const responseData = response.data;
      
      // Support response being an array or containing a data field with an array
      const items = Array.isArray(responseData) ? responseData : (responseData?.data || []);
      
      let syncCount = 0;
      const allRegs = await supabase.select('registration_list') || [];
      
      for (const item of items) {
        const email = (item.email || '').trim().toLowerCase();
        if (!email) continue;
        
        const mappedData = {
          registration_type: item.registration_type || null,
          prefix: item.prefix || null,
          first_name: item.first_name || null,
          middle_initial: item.middle_initial || null,
          last_name: item.last_name || null,
          suffix: item.suffix || null,
          full_name: item.full_name || null,
          email: email,
          phone: item.mobile_number || null,
          age_range: item.age || null,
          gender: item.gender || null,
          nationality: item.country_of_nationality || null,
          affiliation: item.affiliation_type || null,
          affiliation_sub: item.affiliation_category || null,
          designation: item.designation || null,
          affiliation_specify: item.affiliation_specify || null,
          address_country: item.country_of_affiliation || null,
          attendance_mode: 'online',
          dietary: item.dietary_preference || null,
          dietary_details: item.dietary_details || null,
          media_queries: item.media_queries || null,
          created_at: item.created_at || new Date().toISOString(),
          approval_status: 1,
          registration_source: 'tiny_comet'
        };
        
        const existing = allRegs.find(r => (r.email || '').trim().toLowerCase() === email);
        
        if (existing) {
          // Update the record with any changes (e.g. name, designation, etc.) using supabase.update by ID
          await supabase.update('registration_list', mappedData, { id: existing.id });
          syncCount++;
        } else {
          // Insert it into registration_list
          const inserted = await supabase.insert('registration_list', mappedData);
          
          if (inserted && inserted.length > 0) {
            const userId = inserted[0].id;
            
            // Use badge_code from the response (e.g., APSAM-2KEKFF) as visitor_code.
            // If missing, generate one with prefix APSAM
            let visitorCode = item.badge_code;
            if (!visitorCode) {
              visitorCode = generateVisitorCode(userId, 'APSAM');
            }
            
            // Generate a new attendance_key
            const attendanceKey = generateAttendanceKey(userId);
            
            // Insert into attendance_keys collection
            await supabase.insert('attendance_keys', {
              participant_id: userId,
              visitor_code: visitorCode,
              attendance_key: attendanceKey
            });
            
            // Broadcast the new registration to admin panel
            broadcastToAdmins('new_registration', {
              ...mappedData,
              id: userId,
              visitor_code: visitorCode,
              attendance_key: attendanceKey
            });
            
            syncCount++;
          }
        }
      }
      
      return syncCount;
    } catch (error) {
      console.error('[Sync Service] Error syncing registrations:', error.message);
      throw error;
    } finally {
      activeSyncPromise = null;
    }
  })();

  return activeSyncPromise;
}
