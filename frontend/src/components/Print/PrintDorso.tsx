import React from 'react';
import './print.css';
import { ReceiptData } from './PrintReceipt';

interface PrintDorsoProps {
  data?: ReceiptData;
}

const TermsAndConditions: React.FC = () => (
  <div className="dorso-terms">
    <p>
      1) Los términos y condiciones de la garantía están sujetos al resultado del diagnóstico técnico. 
      Durante el ingreso FS S.R.L. solo valida que el plazo de garantía del equipo no haya caducado. 
      Si por alguna razón su equipo estuviera excluido de la garantía, FastService se lo informará 
      así como el presupuesto de reparación.
    </p>
    <p>
      3) No se aceptan reclamos por falta de accesorios o piezas no detalladas en la presente orden 
      al momento de la entrega o retiro, si no han sido declarados en su ingreso. Verifique que 
      figuren los mismos antes de firmar la orden de ingreso al servicio técnico.
    </p>
    <p>
      4) El cliente toma conocimiento y acepta conocer que durante el proceso de diagnóstico, 
      configuración o reparación, los datos almacenados dentro del equipo pueden modificarse o 
      eliminarse de la memoria interna, tarjeta de memoria o SIM, incluye fotografías, agenda, 
      programas o cualquier otro dato no precargado de fábrica, no siendo nada de ello imputable 
      a FS S.R.L. La responsabilidad de efectuar una copia de respaldo es exclusiva del cliente 
      y debe ser previa al ingreso del equipo a service.
    </p>
    <p>
      5) El plazo estimado de reparación de los equipos es de 30 (treinta) días, sujeto a 
      disponibilidad de repuestos en el país. En caso de que no hubiera stock de repuestos, 
      se le notificará el plazo estimado para la reparación de su equipo, siendo su decisión 
      el retiro o permanencia de la unidad en el service.
    </p>
    <p>
      6) En caso de no retirar el equipo dentro de un plazo de 90 (noventa) días contados desde 
      la fecha de ingreso al servicio, o 20 (veinte) días contados desde la notificación que el 
      equipo ha sido reparado será considerado producto abandonado, pudiéndosele cobrar los gastos 
      de depósito y guarda del equipo. Si luego de cumplidos los plazos mencionados y de haber sido 
      notificado de la situación anteriormente referida, Ud. no retira su equipo y/o paga el saldo 
      en concepto de diagnóstico, reparación y/o depósito del equipo, FastService podrá disponer 
      a su criterio de la unidad sin previo aviso.
    </p>
    <p>
      7) FS S.R.L. dispondrá de las piezas reemplazadas y realizará su tratamiento acorde a las 
      políticas de medio ambiente vigentes, no siendo posible su entrega al cliente en concordancia 
      con las políticas de las marcas representadas.
    </p>
    <div className="signature-line">
      <strong>Firma cliente:</strong> ________________________________
    </div>
  </div>
);

const ContactBox: React.FC = () => (
  <div className="dorso-contact-box">
    <p>
      Para consultas llame a los teléfonos <strong>5263-3209 / 4213-0902 / 4213-1554</strong>
    </p>
    <p>
      Correo electrónico <strong>fastservice.consultas@gmail.com</strong>
    </p>
    <p>
      Horario: Lunes a Viernes de 8:30 a 18:00 Hs. Sábado de 8:30 a 13 Hs.
    </p>
  </div>
);

const PrintDorso: React.FC<PrintDorsoProps> = () => {
  return (
    <div className="print-dorso-container">
      <div className="dorso-border">
        {/* Left Copy */}
        <div className="dorso-copy">
          <TermsAndConditions />
        </div>
        
        {/* Divider */}
        <div className="dorso-divider" />
        
        {/* Right Copy */}
        <div className="dorso-copy">
          <TermsAndConditions />
          <ContactBox />
        </div>
      </div>
    </div>
  );
};

export default PrintDorso;
