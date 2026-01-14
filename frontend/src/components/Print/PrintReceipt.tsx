import React from 'react';

export interface ReceiptData {
  reparacionId: number;
  nombre: string;
  telefono1: string;
  telefono2: string;
  direccion: string;
  creadoEn: string;
  marca: string;
  modelo: string;
  serie: string;
  comercio: string;
  accesorios: string;
  esGarantia?: boolean;
}

interface PrintReceiptProps {
  data: ReceiptData;
}

const PrintReceipt: React.FC<PrintReceiptProps> = ({ data }) => {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('es-AR');
    } catch {
      return dateStr;
    }
  };

  return (
    <>
      <style>{`
        .recibo-html, .recibo-body {
          width: 100%;
          height: 100%;
          margin: 0px;
        }

        .recibo-body {
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
          position: relative;
        }

        .recibo-body p {
          margin: 0px;
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
          font-family: Arial, sans-serif;
        }

        .gwd-span-dg02 {
          font-size: 25px;
          font-weight: bold;
          font-family: "Arial Black", Arial, sans-serif;
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
          font-family: "Arial Black", Arial, sans-serif;
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
          font-family: Arial, sans-serif;
          font-size: 16px;
        }

        .gwd-span-3l60 {
          left: 851px;
          height: 158px;
          font-family: Arial, sans-serif;
          font-size: 16px;
        }

        .gwd-span-jqxt {
          position: absolute;
          width: 539px;
          transform-origin: 50% 50% 0px;
          -webkit-transform-origin: 50% 50% 0px;
          -moz-transform-origin: 50% 50% 0px;
          left: 10px;
          font-family: Arial, sans-serif;
          top: 389px;
          height: 208px;
        }

        .gwd-span-1r93 {
          position: absolute;
          width: 539px;
          transform-origin: 50% 50% 0px;
          -webkit-transform-origin: 50% 50% 0px;
          -moz-transform-origin: 50% 50% 0px;
          font-family: Arial, sans-serif;
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
          font-family: Arial, sans-serif;
          font-size: 16px;
        }

        .gwd-span-kg5j {
          height: 158px;
          font-family: Arial, sans-serif;
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
          font-family: Arial, sans-serif;
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
          @page {
            size: landscape;
            margin: 0;
          }
          
          body * {
            visibility: hidden;
          }
          
          .print-receipt-wrapper,
          .print-receipt-wrapper * {
            visibility: visible;
          }
          
          .print-receipt-wrapper {
            position: absolute;
            left: 0;
            top: 0;
          }
          
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      
      <div className="print-receipt-wrapper">
        <div className="recibo-body">
          {/* Vertical Divider Line */}
          <svg data-gwd-shape="path" preserveAspectRatio="none" viewBox="0 0 2 718" className="gwd-path-1q98">
            <path strokeLinecap="round" strokeLinejoin="round" d="M 0.5,0.5 C 0.5,0.5 1.5,717.5 1.5,717.5"></path>
          </svg>

          {/* Left Header - Customer Copy */}
          <span className="gwd-span-1yyy gwd-span-11xw">
            <span className="gwd-span-dg02 gwd-span-1wew">FAST SERVICE</span>{' '}
            <span className="gwd-span-4ilv"></span>&nbsp; &nbsp;
            <span className="gwd-span-1rcg">Ticket </span>
            <span className="gwd-span-x3p3 gwd-span-10ie">
              {data.reparacionId}
            </span>
          </span>

          {/* Right Header - Company Copy */}
          <span className="gwd-span-1yyy gwd-span-czon">
            <span className="gwd-span-dg02 gwd-span-rza2">FAST SERVICE</span>{' '}
            <span className="gwd-span-4ilv"></span>&nbsp; &nbsp;{' '}
            <span className="gwd-span-1rcg">Ticket&nbsp; </span>
            <span className="gwd-span-x3p3 gwd-span-7lr9">
              {data.reparacionId}
            </span>
          </span>

          {/* Left Banner */}
          <img className="gwd-img-7f69" src="/images/banner.png" alt="Banner" />
          
          {/* Right Banner */}
          <img className="gwd-img-7f69 gwd-img-ol5n" src="/images/banner.png" alt="Banner" />

          {/* Left Customer Info */}
          <span className="gwd-span-1ul5 gwd-span-4tg2">
            Cliente: {data.nombre} <br />
            Teléfono: {data.telefono1}<br />
            Celular: {data.telefono2}<br />
            Dirección: {data.direccion}<br />
            Fecha de ingreso: {formatDate(data.creadoEn)}
          </span>

          {/* Right Customer Info */}
          <span className="gwd-span-1ul5 gwd-span-14bb">
            Cliente: {data.nombre} <br />
            Teléfono: {data.telefono1}<br />
            Celular: {data.telefono2}<br />
            Dirección: {data.direccion}<br />
            Fecha de ingreso: {formatDate(data.creadoEn)}
          </span>

          {/* Left Device Info */}
          <span className="gwd-span-1ul5 gwd-span-194w gwd-span-kg5j">
            Marca: {data.marca}<br />
            Modelo: {data.modelo}<br />
            Serie: {data.serie}<br />
            Comercio: {data.comercio}<br />
            Accesorios: {data.accesorios}
          </span>

          {/* Right Device Info */}
          <span className="gwd-span-1ul5 gwd-span-194w gwd-span-3l60">
            Marca: {data.marca}<br />
            Modelo: {data.modelo}<br />
            Serie: {data.serie}<br />
            Comercio: {data.comercio}<br />
            Accesorios: {data.accesorios}
          </span>

          {/* Left Notes Section - Customer Copy */}
          <span className="gwd-span-jqxt gwd-span-1e8n">
            Notas: ______________________________________________________<br /><br />
            ____________________________________________________________<br /><br />
            ____________________________________________________________<br /><br />
            ____________________________________________________________<br /><br />
            Garantía válida por ______________ sujeta a las condiciones expresadas al dorso.<br /><br />
            Firma: ________________________
          </span>

          {/* Right Notes Section - Company Copy */}
          <span className="gwd-span-jqxt gwd-span-urqr">
            Reparación efectuada: _________________________________________<br /><br />
            ____________________________________________________________<br /><br />
            ____________________________________________________________<br /><br />
            Presupuesto: _________________________________________________<br /><br />
            Fecha de entrega: _____________________________________________<br /><br />
            Recibí conforme: ______________________________________________
          </span>

          {/* Left Contact Box - Customer Copy */}
          <span className="gwd-span-1r93 gwd-span-11jm">
            WhatsApp:&nbsp;<span className="gwd-span-1jzl">113518-6968  </span>
            Teléfono:&nbsp;<span className="gwd-span-1jzl">115263-3209</span><br />
            <span>Correo electrónico</span>: <span className="gwd-span-7cuz">nadiafastservice@gmail.com</span><br />
            Horarios: Lunes a Viernes de 08:30 a 18:00 horas. Sábados de 08:30 a 13:00 horas.
          </span>

          {/* Right Contact Box - Company Copy (Shows customer name and large ticket number) */}
          <span className="gwd-span-1r93 gwd-span-1htz">
            {data.nombre.toUpperCase()}&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; {formatDate(data.creadoEn)}<br />
            <span className="gwd-span-1ks0">{data.reparacionId}</span>
          </span>

          {/* Outer Border */}
          <span className="gwd-span-1uzy" id="border"><br /></span>
        </div>
      </div>
    </>
  );
};

export default PrintReceipt;
