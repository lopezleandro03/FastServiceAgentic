import React, { useRef, useCallback, useEffect } from 'react';
import { Button } from '../ui/button';
import { X, Printer } from 'lucide-react';
import PrintReceipt, { ReceiptData } from './PrintReceipt';
import PrintDorso from './PrintDorso';
import './print.css';

interface PrintContainerProps {
  data: ReceiptData;
  type: 'receipt' | 'dorso';
  isOpen: boolean;
  onClose: () => void;
}

const PrintContainer: React.FC<PrintContainerProps> = ({ data, type, isOpen, onClose }) => {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  // Handle escape key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="print-preview-modal" onClick={onClose}>
      <div className="print-preview-content" onClick={(e) => e.stopPropagation()}>
        {/* Header with actions - hidden during print */}
        <div className="print-preview-header no-print">
          <h2 className="text-lg font-semibold">
            {type === 'receipt' ? 'Vista Previa - Recibo (Frente)' : 'Vista Previa - Recibo (Dorso)'}
          </h2>
          <div className="print-preview-actions">
            <Button onClick={handlePrint} variant="default">
              <Printer className="h-4 w-4 mr-2" />
              Imprimir
            </Button>
            <Button onClick={onClose} variant="outline">
              <X className="h-4 w-4 mr-2" />
              Cerrar
            </Button>
          </div>
        </div>

        {/* Print Content */}
        <div className="print-preview-body" ref={printRef}>
          {type === 'receipt' ? (
            <PrintReceipt data={data} />
          ) : (
            <PrintDorso data={data} />
          )}
        </div>
      </div>
    </div>
  );
};

export default PrintContainer;

// Utility function to open print in new window with EXACT original HTML/CSS
export const openPrintWindow = (data: ReceiptData, type: 'receipt' | 'dorso'): void => {
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  
  if (!printWindow) {
    alert('Por favor, habilite las ventanas emergentes para imprimir.');
    return;
  }

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR');
    } catch {
      return dateStr;
    }
  };

  // EXACT HTML/CSS from original Recibo.cshtml (Google Web Designer generated)
  const receiptHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Recibo Fast Service - #${data.reparacionId}</title>
    <meta name="generator" content="Google Web Designer 11.0.2.0415">
    <style type="text/css" id="gwd-text-style">
        p {
            margin: 0px;
        }
        h1 {
            margin: 0px;
        }
        h2 {
            margin: 0px;
        }
        h3 {
            margin: 0px;
        }
    </style>
    <style type="text/css">
        html,
        body {
            width: 100%;
            height: 100%;
            margin: 0px;
        }

        body {
            background-color: transparent;
            transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            -webkit-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            -moz-transform: matrix3d(1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1);
            perspective: 1400px;
            -webkit-perspective: 1400px;
            -moz-perspective: 1400px;
            transform-style: preserve-3d;
            -webkit-transform-style: preserve-3d;
            -moz-transform-style: preserve-3d;
        }

        .gwd-path-1q98 {
            position: absolute;
            stroke: rgb(0, 0, 0);
            fill: rgb(12, 12, 12);
            left: 563px;
            top: -1px;
            width: 4px;
            stroke-width: 3px;
            height: 712px;
        }

        .gwd-span-1yyy {
            position: absolute;
            left: 0px;
            top: 0px;
            height: 49px;
            transform-origin: 50% 50% 0px;
            -webkit-transform-origin: 50% 50% 0px;
            -moz-transform-origin: 50% 50% 0px;
            width: 500px;
            font-family: Arial;
        }

        .gwd-span-dg02 {
            font-size: 25px;
            font-weight: bold;
            font-family: "Arial Black";
        }

        .gwd-span-4ilv {
            font-size: 18px;
        }

        .gwd-span-1rcg {
            font-size: 18px;
        }

        .gwd-span-x3p3 {
            font-size: 25px;
            font-weight: bold;
            font-family: "Arial Black";
        }

        .gwd-span-czon {
            text-align: left;
            left: 570px;
            width: 560px;
        }

        .gwd-img-7f69 {
            position: absolute;
            height: 133px;
            background-color: rgb(12, 12, 12);
            left: 10px;
            width: 550px;
            top: 50px;
        }

        .gwd-img-ol5n {
            left: 570px;
        }

        .gwd-span-1ul5 {
            position: absolute;
            left: 10px;
            top: 200px;
            height: 172px;
            width: 275px;
            transform-origin: 50% 50% 0px;
            -webkit-transform-origin: 50% 50% 0px;
            -moz-transform-origin: 50% 50% 0px;
            font-size: 18px;
            margin: 0px;
            border-radius: 1px;
            border-width: 1px;
            border-style: none;
        }

        .gwd-span-194w {
            left: 285px;
        }

        .gwd-span-14bb {
            left: 576px;
            height: 158px;
            font-family: Arial;
            font-size: 16px;
        }

        .gwd-span-3l60 {
            left: 851px;
            height: 158px;
            font-family: Arial;
            font-size: 16px;
        }

        .gwd-span-jqxt {
            position: absolute;
            width: 539px;
            transform-origin: 50% 50% 0px;
            -webkit-transform-origin: 50% 50% 0px;
            -moz-transform-origin: 50% 50% 0px;
            left: 10px;
            font-family: Arial;
            top: 389px;
            height: 208px;
        }

        .gwd-span-1r93 {
            position: absolute;
            width: 539px;
            transform-origin: 50% 50% 0px;
            -webkit-transform-origin: 50% 50% 0px;
            -moz-transform-origin: 50% 50% 0px;
            font-family: Arial;
            border-style: solid;
            border-width: 2px;
            margin: 0px;
            padding: 5px;
            height: 74px;
            left: 9px;
            top: 614px;
        }

        .gwd-span-1jzl {
            font-weight: bold;
        }

        .gwd-span-1fxu {
            font-weight: bold;
        }

        .gwd-span-1jf9 {
            font-weight: bold;
        }

        .gwd-span-7cuz {
            font-weight: bold;
        }

        .gwd-span-urqr {
            left: 576px;
            top: 358px;
        }

        .gwd-span-1htz {
            left: 576px;
            text-align: center;
            padding: 0px;
            border-style: none;
            height: 102px;
        }

        .gwd-span-1ks0 {
            font-size: 75px;
        }

        .gwd-span-4tg2 {
            height: 157px;
            font-family: Arial;
            font-size: 16px;
        }

        .gwd-span-kg5j {
            height: 158px;
            font-family: Arial;
            font-size: 16px;
        }

        .gwd-span-1e8n {
            top: 358px;
        }

        .gwd-span-11xw {
            text-align: center;
            width: 560px;
        }

        .gwd-span-1wew {
            font-size: xx-large;
        }

        .gwd-span-10ie {
            font-size: xx-large;
        }

        .gwd-span-rza2 {
            font-size: xx-large;
        }

        .gwd-span-7lr9 {
            font-size: xx-large;
        }

        .gwd-span-11jm {
            padding: 10px;
            left: 1px;
        }

        .gwd-span-1uzy {
            position: absolute;
            width: 1129px;
            font-family: Arial;
            text-align: center;
            top: 0px;
            transform-origin: 50% 50% 0px;
            -webkit-transform-origin: 50% 50% 0px;
            -moz-transform-origin: 50% 50% 0px;
            border-style: solid;
            border-width: 3px;
            left: 0px;
            height: 706px;
        }

        @media print {
            @page { size: landscape; margin: 0; }
        }
    </style>
</head>

<body class="htmlNoPages">
    <svg data-gwd-shape="path" preserveAspectRatio="none" viewBox="0 0 2 718" class="gwd-path-1q98">
        <path stroke-linecap="round" stroke-linejoin="round" d="M 0.5,0.5 C 0.5,0.5 1.5,717.5 1.5,717.5"></path>
    </svg>
    <span class="gwd-span-1yyy gwd-span-11xw">
        <span class="gwd-span-dg02 gwd-span-1wew">FAST SERVICE</span> <span class="gwd-span-4ilv"></span>&nbsp; &nbsp;<span class="gwd-span-1rcg">Ticket </span>
        <span class="gwd-span-x3p3 gwd-span-10ie">${data.reparacionId}</span>
    </span>
    <span class="gwd-span-1yyy gwd-span-czon">
        <span class="gwd-span-dg02 gwd-span-rza2">FAST SERVICE</span> <span class="gwd-span-4ilv"></span>&nbsp; &nbsp; <span class="gwd-span-1rcg">Ticket&nbsp; </span>
        <span class="gwd-span-x3p3 gwd-span-7lr9">${data.reparacionId}</span>
    </span>
    <img class="gwd-img-7f69" src="/images/banner.png">
    <img class="gwd-img-7f69 gwd-img-ol5n" src="/images/banner.png">
    <span class="gwd-span-1ul5 gwd-span-4tg2">
        Cliente: ${data.nombre} <br>
        Teléfono: ${data.telefono1}<br>
        Celular: ${data.telefono2}<br>
        Dirección: ${data.direccion}<br>
        Fecha de ingreso: ${formatDate(data.creadoEn)}
    </span>
    <span class="gwd-span-1ul5 gwd-span-14bb">
        Cliente: ${data.nombre} <br>
        Teléfono: ${data.telefono1}<br>
        Celular: ${data.telefono2}<br>
        Dirección: ${data.direccion}<br>
        Fecha de ingreso: ${formatDate(data.creadoEn)}
    </span>
    <span class="gwd-span-1ul5 gwd-span-194w gwd-span-kg5j">
        Marca: ${data.marca}<br>
        Modelo: ${data.modelo}<br>
        Serie: ${data.serie}<br>
        Comercio: ${data.comercio}<br>
        Accesorios: ${data.accesorios}
    </span>
    <span class="gwd-span-1ul5 gwd-span-194w gwd-span-3l60">
        Marca: ${data.marca}<br>
        Modelo: ${data.modelo}<br>
        Serie: ${data.serie}<br>
        Comercio: ${data.comercio}<br>
        Accesorios: ${data.accesorios}
    </span>
    <span class="gwd-span-jqxt gwd-span-1e8n">
        Notas: ______________________________________________________<br><br>
        ____________________________________________________________<br><br>
        ____________________________________________________________<br><br>
        ____________________________________________________________<br><br>
        Garantía válida por ______________ sujeta a las condiciones expresadas al dorso.<br><br>
        Firma: ________________________
    </span>
    <span class="gwd-span-jqxt gwd-span-urqr">
        Reparación efectuada: _________________________________________<br><br>
        ____________________________________________________________<br><br>
        ____________________________________________________________<br><br>
        Presupuesto: _________________________________________________<br><br>
        Fecha de entrega: _____________________________________________<br><br>
        Recibí conforme: ______________________________________________
    </span>
    <span class="gwd-span-1r93 gwd-span-11jm">
        WhatsApp:&nbsp;<span class="gwd-span-1jzl">113518-6968  </span>
        Teléfono:&nbsp;<span class="gwd-span-1jzl">115263-3209</span><br>
        <span>Correo electrónico</span>: <span class="gwd-span-7cuz">nadiafastservice@gmail.com</span><br>
        Horarios: Lunes a Viernes de 08:30 a 18:00 horas. Sábados de 08:30 a 13:00 horas.
    </span>
    <span class="gwd-span-1r93 gwd-span-1htz">
        ${data.nombre.toUpperCase()}&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; ${formatDate(data.creadoEn)}<br><span class="gwd-span-1ks0">${data.reparacionId}</span>
    </span>
    <span class="gwd-span-1uzy" id="border"><br></span>
    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
        };
    </script>
</body>
</html>`;

  // Dorso HTML - Terms and conditions (back of receipt)
  const dorsoHtml = `<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Dorso Recibo Fast Service - #${data.reparacionId}</title>
    <style type="text/css">
        html, body {
            width: 100%;
            height: 100%;
            margin: 0px;
            font-family: Arial, sans-serif;
            font-size: 11px;
        }
        .container {
            width: 1129px;
            height: 706px;
            position: relative;
            margin: 0 auto;
        }
        .dorso-copy {
            position: absolute;
            width: 530px;
            top: 20px;
            padding: 15px;
        }
        .dorso-copy.left {
            left: 10px;
        }
        .dorso-copy.right {
            left: 575px;
        }
        .divider {
            position: absolute;
            left: 563px;
            top: 0px;
            width: 4px;
            height: 706px;
            background-color: rgb(12, 12, 12);
        }
        .terms-title {
            font-size: 14px;
            font-weight: bold;
            margin-bottom: 10px;
            text-align: center;
        }
        .terms-content p {
            margin-bottom: 8px;
            text-align: justify;
            line-height: 1.3;
        }
        .signature-section {
            margin-top: 20px;
            padding-top: 10px;
            border-top: 1px solid #000;
        }
        .contact-box {
            margin-top: 15px;
            padding: 10px;
            border: 2px solid #000;
            text-align: center;
            font-size: 12px;
        }
        .contact-box p {
            margin: 5px 0;
        }
        @media print {
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            @page { size: landscape; margin: 0; }
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Left Copy -->
        <div class="dorso-copy left">
            <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
            <div class="terms-content">
                <p><strong>1)</strong> Los términos y condiciones de la garantía están sujetos al resultado del diagnóstico técnico. Durante el ingreso FS S.R.L. solo valida que el plazo de garantía del equipo no haya caducado. Si por alguna razón su equipo estuviera excluido de la garantía, FastService se lo informará así como el presupuesto de reparación.</p>
                <p><strong>2)</strong> El cliente toma conocimiento y acepta que el tiempo de reparación dependerá de la disponibilidad de repuestos y de la complejidad de la falla detectada.</p>
                <p><strong>3)</strong> No se aceptan reclamos por falta de accesorios o piezas no detalladas en la presente orden al momento de la entrega o retiro, si no han sido declarados en su ingreso. Verifique que figuren los mismos antes de firmar la orden de ingreso al servicio técnico.</p>
                <p><strong>4)</strong> El cliente toma conocimiento y acepta conocer que durante el proceso de diagnóstico, configuración o reparación, los datos almacenados dentro del equipo pueden modificarse o eliminarse de la memoria interna, tarjeta de memoria o SIM, incluye fotografías, agenda, programas o cualquier otro dato no precargado de fábrica, no siendo nada de ello imputable a FS S.R.L. La responsabilidad de efectuar una copia de respaldo es exclusiva del cliente y debe ser previa al ingreso del equipo a service.</p>
                <p><strong>5)</strong> El plazo estimado de reparación de los equipos es de 30 (treinta) días, sujeto a disponibilidad de repuestos en el país. En caso de que no hubiera stock de repuestos, se le notificará el plazo estimado para la reparación de su equipo, siendo su decisión el retiro o permanencia de la unidad en el service.</p>
                <p><strong>6)</strong> En caso de no retirar el equipo dentro de un plazo de 90 (noventa) días contados desde la fecha de ingreso al servicio, o 20 (veinte) días contados desde la notificación que el equipo ha sido reparado será considerado producto abandonado, pudiéndosele cobrar los gastos de depósito y guarda del equipo.</p>
                <p><strong>7)</strong> FS S.R.L. dispondrá de las piezas reemplazadas y realizará su tratamiento acorde a las políticas de medio ambiente vigentes, no siendo posible su entrega al cliente.</p>
            </div>
            <div class="signature-section">
                <strong>Firma cliente:</strong> ________________________________
            </div>
        </div>
        
        <!-- Divider -->
        <div class="divider"></div>
        
        <!-- Right Copy -->
        <div class="dorso-copy right">
            <div class="terms-title">TÉRMINOS Y CONDICIONES</div>
            <div class="terms-content">
                <p><strong>1)</strong> Los términos y condiciones de la garantía están sujetos al resultado del diagnóstico técnico. Durante el ingreso FS S.R.L. solo valida que el plazo de garantía del equipo no haya caducado. Si por alguna razón su equipo estuviera excluido de la garantía, FastService se lo informará así como el presupuesto de reparación.</p>
                <p><strong>2)</strong> El cliente toma conocimiento y acepta que el tiempo de reparación dependerá de la disponibilidad de repuestos y de la complejidad de la falla detectada.</p>
                <p><strong>3)</strong> No se aceptan reclamos por falta de accesorios o piezas no detalladas en la presente orden al momento de la entrega o retiro, si no han sido declarados en su ingreso. Verifique que figuren los mismos antes de firmar la orden de ingreso al servicio técnico.</p>
                <p><strong>4)</strong> El cliente toma conocimiento y acepta conocer que durante el proceso de diagnóstico, configuración o reparación, los datos almacenados dentro del equipo pueden modificarse o eliminarse de la memoria interna, tarjeta de memoria o SIM, incluye fotografías, agenda, programas o cualquier otro dato no precargado de fábrica, no siendo nada de ello imputable a FS S.R.L. La responsabilidad de efectuar una copia de respaldo es exclusiva del cliente y debe ser previa al ingreso del equipo a service.</p>
                <p><strong>5)</strong> El plazo estimado de reparación de los equipos es de 30 (treinta) días, sujeto a disponibilidad de repuestos en el país. En caso de que no hubiera stock de repuestos, se le notificará el plazo estimado para la reparación de su equipo, siendo su decisión el retiro o permanencia de la unidad en el service.</p>
                <p><strong>6)</strong> En caso de no retirar el equipo dentro de un plazo de 90 (noventa) días contados desde la fecha de ingreso al servicio, o 20 (veinte) días contados desde la notificación que el equipo ha sido reparado será considerado producto abandonado, pudiéndosele cobrar los gastos de depósito y guarda del equipo.</p>
                <p><strong>7)</strong> FS S.R.L. dispondrá de las piezas reemplazadas y realizará su tratamiento acorde a las políticas de medio ambiente vigentes, no siendo posible su entrega al cliente.</p>
            </div>
            <div class="signature-section">
                <strong>Firma cliente:</strong> ________________________________
            </div>
            <div class="contact-box">
                <p>Para consultas llame a los teléfonos <strong>5263-3209 / 4213-0902 / 4213-1554</strong></p>
                <p>WhatsApp: <strong>113518-6968</strong></p>
                <p>Correo electrónico: <strong>nadiafastservice@gmail.com</strong></p>
                <p>Horario: Lunes a Viernes de 8:30 a 18:00 Hs. Sábado de 8:30 a 13 Hs.</p>
            </div>
        </div>
    </div>
    <script>
        window.onload = function() {
            setTimeout(function() { window.print(); }, 500);
        };
    </script>
</body>
</html>`;

  const htmlContent = type === 'dorso' ? dorsoHtml : receiptHtml;
  printWindow.document.write(htmlContent);
  printWindow.document.close();
};
