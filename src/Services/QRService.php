<?php

namespace App\Services;

use App\Output\QRImageWithLogoAndText;
use chillerlan\QRCode\Common\EccLevel;
use chillerlan\QRCode\Data\QRMatrix;
use chillerlan\QRCode\QRCode;
use chillerlan\QRCode\QROptions;

class QRService
{
    private const LOGO_PATH = __DIR__ . '/../../public/assets/fao-logo.png';

    public function generate(string $data): string
    {
        return $this->render($data, false);
    }

    public function generateWithLogo(string $data): string
    {
        return $this->render($data, true);
    }

    private function render(string $data, bool $withLogo): string
    {
        $options = new QROptions();

        $options->version      = 5;
        $options->scale        = 5;
        $options->outputBase64 = false;
        $options->keepAsSquare = [QRMatrix::M_FINDER, QRMatrix::M_FINDER_DOT];
        $options->eccLevel     = EccLevel::H;
        $options->moduleValues = [
            QRMatrix::M_FINDER_DARK    => [87, 145, 202],
            QRMatrix::M_FINDER_DOT     => [87, 145, 202],
            QRMatrix::M_ALIGNMENT_DARK => [87, 145, 202],
            QRMatrix::M_ALIGNMENT      => [233, 233, 233],
        ];

        if ($withLogo) {
            $options->addLogoSpace    = true;
            $options->logoSpaceWidth  = 13;
            $options->logoSpaceHeight = 13;
        }

        $qrcode = new QRCode($options);
        $qrcode->addByteSegment($data);

        $output = new QRImageWithLogoAndText($options, $qrcode->getQRMatrix());

        return $output->dump(null, $data, $withLogo ? self::LOGO_PATH : null);
    }
}
