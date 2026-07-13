import test from 'node:test';
import assert from 'node:assert';

// Mock the firebase/app module
test.mock.method(await import('firebase/app'), 'initializeApp', () => {
  return {};
});

// Mock firebase/storage module
test.mock.method(await import('firebase/storage'), 'getStorage', () => {
  return {};
});

// Mock the firebase/firestore modules
const mockFirestore = {
  addDoc: null,
  getDocs: null,
  updateDoc: null,
  deleteDoc: null,
  writeBatch: null
};

test.mock.method(await import('firebase/firestore'), 'getFirestore', () => {
  return {};
});

test.mock.method(await import('firebase/firestore'), 'collection', (db, name) => {
  return { db, name };
});

test.mock.method(await import('firebase/firestore'), 'addDoc', async (colRef, data) => {
  if (mockFirestore.addDoc) {
    return mockFirestore.addDoc(colRef, data);
  }
  return { id: 'mock-doc-id-123' };
});

test.mock.method(await import('firebase/firestore'), 'getDocs', async (q) => {
  if (mockFirestore.getDocs) {
    return mockFirestore.getDocs(q);
  }
  return {
    forEach: (cb) => {
      cb({
        id: 'mock-doc-id-123',
        exists: () => true,
        data: () => ({ email: 'test@example.com', approval_status: 1 })
      });
    }
  };
});

test.mock.method(await import('firebase/firestore'), 'doc', (db, colName, id) => {
  return { db, colName, id };
});

test.mock.method(await import('firebase/firestore'), 'updateDoc', async (docRef, data) => {
  if (mockFirestore.updateDoc) {
    return mockFirestore.updateDoc(docRef, data);
  }
  return {};
});

test.mock.method(await import('firebase/firestore'), 'deleteDoc', async (docRef) => {
  if (mockFirestore.deleteDoc) {
    return mockFirestore.deleteDoc(docRef);
  }
  return {};
});

const batchUpdates = [];
const batchDeletes = [];
test.mock.method(await import('firebase/firestore'), 'writeBatch', () => {
  return {
    update: (docRef, data) => {
      batchUpdates.push({ docRef, data });
    },
    delete: (docRef) => {
      batchDeletes.push(docRef);
    },
    commit: async () => {
      return {};
    }
  };
});

// Now import the firebase service to test it
const firebaseService = await import('../api/services/firebase.js');

test.describe('Firebase Service Query Integration Tests', () => {
  test.beforeEach(() => {
    mockFirestore.addDoc = null;
    mockFirestore.getDocs = null;
    mockFirestore.updateDoc = null;
    mockFirestore.deleteDoc = null;
    batchUpdates.length = 0;
    batchDeletes.length = 0;
  });

  test('insert() adds document and returns array with generated ID', async () => {
    mockFirestore.addDoc = async (colRef, data) => {
      assert.strictEqual(colRef.name, 'registration_list');
      assert.strictEqual(data.email, 'new@example.com');
      return { id: 'new-id-999' };
    };

    const result = await firebaseService.insert('registration_list', { email: 'new@example.com' });
    assert.deepStrictEqual(result, [{ id: 'new-id-999', email: 'new@example.com' }]);
  });

  test('select() retrieves and transforms documents with query filters', async () => {
    const mockData = [
      { id: '1', data: () => ({ email: 'a@example.com' }) },
      { id: '2', data: () => ({ email: 'b@example.com' }) }
    ];
    mockFirestore.getDocs = async () => {
      return {
        forEach: (cb) => mockData.forEach(cb)
      };
    };

    const result = await firebaseService.select('registration_list', { email: 'a@example.com' });
    assert.strictEqual(result.length, 2);
    assert.strictEqual(result[0].id, '1');
    assert.strictEqual(result[0].email, 'a@example.com');
  });

  test('update() performs select first and then updates matching document', async () => {
    const mockData = [
      { id: 'updated-id', data: () => ({ email: 'update-me@example.com' }) }
    ];
    mockFirestore.getDocs = async () => {
      return {
        forEach: (cb) => mockData.forEach(cb)
      };
    };

    let updateCalled = false;
    mockFirestore.updateDoc = async (docRef, data) => {
      assert.strictEqual(docRef.id, 'updated-id');
      assert.strictEqual(data.approval_status, 1);
      updateCalled = true;
    };

    const result = await firebaseService.update('registration_list', { approval_status: 1 }, { email: 'update-me@example.com' });
    assert.ok(updateCalled);
    assert.strictEqual(result[0].id, 'updated-id');
    assert.strictEqual(result[0].approval_status, 1);
  });

  test('remove() deletes matching documents', async () => {
    const mockData = [
      { id: 'delete-id', data: () => ({ email: 'delete-me@example.com' }) }
    ];
    mockFirestore.getDocs = async () => {
      return {
        forEach: (cb) => mockData.forEach(cb)
      };
    };

    let deleteCalled = false;
    mockFirestore.deleteDoc = async (docRef) => {
      assert.strictEqual(docRef.id, 'delete-id');
      deleteCalled = true;
    };

    const result = await firebaseService.remove('registration_list', { email: 'delete-me@example.com' });
    assert.ok(result);
    assert.ok(deleteCalled);
  });

  test('updateBatch() updates matching items in batch', async () => {
    const mockData = [
      { id: 'id-1', data: () => ({ visitor_code: 'V001', name: 'Alice' }) },
      { id: 'id-2', data: () => ({ visitor_code: 'V002', name: 'Bob' }) }
    ];
    mockFirestore.getDocs = async () => {
      return {
        forEach: (cb) => mockData.forEach(cb)
      };
    };

    const result = await firebaseService.updateBatch('registration_list', { approval_status: 1 }, 'visitor_code', ['V001']);
    assert.strictEqual(result.length, 1);
    assert.strictEqual(result[0].id, 'id-1');
    assert.strictEqual(result[0].approval_status, 1);
    assert.strictEqual(batchUpdates.length, 1);
    assert.strictEqual(batchUpdates[0].docRef.id, 'id-1');
  });

  test('removeBatch() deletes matching items in batch', async () => {
    const mockData = [
      { id: 'id-1', data: () => ({ visitor_code: 'V001' }) },
      { id: 'id-2', data: () => ({ visitor_code: 'V002' }) }
    ];
    mockFirestore.getDocs = async () => {
      return {
        forEach: (cb) => mockData.forEach(cb)
      };
    };

    const result = await firebaseService.removeBatch('registration_list', 'visitor_code', ['V002']);
    assert.ok(result);
    assert.strictEqual(batchDeletes.length, 1);
    assert.strictEqual(batchDeletes[0].id, 'id-2');
  });
});
