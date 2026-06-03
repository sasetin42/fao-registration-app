<?php

namespace App\Output;

use chillerlan\QRCode\Output\QRCodeOutputException;
use chillerlan\QRCode\Output\QRGdImage;
use chillerlan\QRCode\Output\QROutputInterface;

class QRImageWithLogoAndText extends QRGdImage
{
    public function dump(string $file = null, string $text = null, string $logo = null): string
    {
        $this->options->returnResource = true;

        parent::dump($file);

        if ($logo !== null) {
            if (!is_file($logo) || !is_readable($logo)) {
                throw new QRCodeOutputException('Invalid logo file.');
            }

            $im = imagecreatefrompng($logo);
            $lw = (int)(($this->options->logoSpaceWidth  - 2) * $this->options->scale);
            $lh = (int)(($this->options->logoSpaceHeight - 2) * $this->options->scale);
            $ql = (int)($this->matrix->getSize() * $this->options->scale);

            imagecopyresampled(
                $this->image, $im,
                (int)(($ql - $lw) / 2), (int)(($ql - $lh) / 2),
                0, 0, $lw, $lh, imagesx($im), imagesy($im)
            );
        }

        if ($text !== null) {
            $this->addText($text);
        }

        $imageData = $this->dumpImage();
        $this->saveToFile($imageData, $file);

        if ($this->options->outputBase64) {
            $imageData = $this->toBase64DataURI($imageData, 'image/' . $this->options->outputType);
        }

        return $imageData;
    }

    protected function addText(string $text): void
    {
        $qrcode   = $this->image;
        $textSize = 5;
        $bgWidth  = $this->length;
        $bgHeight = $bgWidth + 25;

        $this->image = imagecreatetruecolor($bgWidth, $bgHeight);
        $background  = imagecolorallocate($this->image, 255, 255, 255);

        if ($this->options->imageTransparent && $this->options->outputType !== QROutputInterface::GDIMAGE_JPG) {
            imagecolortransparent($this->image, $background);
        }

        imagefilledrectangle($this->image, 0, 0, $bgWidth, $bgHeight, $background);
        imagecopymerge($this->image, $qrcode, 0, 0, 0, 0, $this->length, $this->length, 100);
        imagedestroy($qrcode);

        $fontColor = imagecolorallocate($this->image, 50, 50, 50);
        $charWidth = imagefontwidth($textSize);
        $x         = (int) round(($bgWidth - strlen($text) * $charWidth) / 2);

        foreach (str_split($text) as $i => $chr) {
            imagechar($this->image, $textSize, (int)($i * $charWidth + $x), $this->length, $chr, $fontColor);
        }
    }
}
