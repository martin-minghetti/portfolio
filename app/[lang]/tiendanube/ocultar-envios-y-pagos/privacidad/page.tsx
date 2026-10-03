import type { Metadata } from "next";
import { LegalPage, BASE_PATH } from "../Legal";

export const metadata: Metadata = {
  title: "Política de privacidad · Ocultar Envíos y Pagos",
  alternates: { canonical: `${BASE_PATH}/privacidad` },
};

export default function PrivacidadPage() {
  return (
    <LegalPage>
      <h1>Política de privacidad</h1>
      <p className="text-[var(--color-fg-muted)]">Ocultar Envíos y Pagos, de Mingo · Última actualización: 3 de octubre de 2026</p>

      <p>Esta política explica qué datos usa la aplicación Ocultar Envíos y Pagos (la &quot;app&quot;) para tiendas de Tiendanube, para qué los usa, dónde se guardan y cómo se borran.</p>

      <h2>Quién es el responsable</h2>
      <p>Mingo, de Martín Minghetti, San Carlos de Bariloche, Río Negro, Argentina. Contacto: <a href="mailto:martin.minghetti+tienda.nube@gmail.com">martin.minghetti+tienda.nube@gmail.com</a>.</p>

      <h2>Qué datos guardamos</h2>
      <ul>
        <li><strong>De la tienda</strong>, al instalar la app: número de tienda, nombre, dirección web, e-mail de la cuenta y el permiso de acceso que da Tiendanube (con los alcances que la tienda aprobó).</li>
        <li><strong>Las reglas</strong> que crea el comerciante: la condición (producto, categoría o monto), los envíos y medios de pago elegidos y si la regla está activa.</li>
        <li><strong>La suscripción</strong>: el identificador y el estado de la suscripción de Mercado Pago, y la fecha de fin de la prueba gratis.</li>
      </ul>

      <h2>Qué datos no guardamos</h2>
      <ul>
        <li><strong>Datos de los compradores.</strong> En cada compra, Tiendanube le manda a la app el contenido del carrito para que responda qué envíos y medios de pago mostrar. La app lo usa solo para esa respuesta y no lo guarda.</li>
        <li><strong>Datos de tarjetas o cuentas bancarias.</strong> El pago de la suscripción se hace en Mercado Pago. El e-mail que se ingresa para pagar se le envía a Mercado Pago para crear la suscripción y la app no lo guarda.</li>
      </ul>

      <h2>Para qué usamos los datos</h2>
      <ul>
        <li>Mostrar el panel de la app y las reglas dentro del administrador de Tiendanube.</li>
        <li>Leer los productos, categorías, envíos y medios de pago de la tienda para armar y aplicar las reglas.</li>
        <li>Aplicar las reglas en el checkout de la tienda.</li>
        <li>Gestionar la prueba gratis y el cobro de la suscripción.</li>
        <li>Responder consultas de soporte.</li>
      </ul>
      <p>No vendemos ni compartimos los datos con terceros para publicidad.</p>

      <h2>Dónde se guardan y quién los procesa</h2>
      <ul>
        <li><strong>Supabase</strong> (base de datos), en servidores de São Paulo, Brasil.</li>
        <li><strong>Vercel</strong> (servidores de la app), en São Paulo, Brasil. Guarda registros técnicos de funcionamiento (número de tienda, errores y tiempos de respuesta) por un período corto.</li>
        <li><strong>Mercado Pago</strong>, para el cobro de la suscripción, según su propia política de privacidad.</li>
        <li><strong>Tiendanube</strong>, que es la plataforma donde funciona la app, según su propia política de privacidad.</li>
      </ul>

      <h2>Cuánto tiempo los guardamos</h2>
      <p>Mientras la app esté instalada. Al desinstalarla, la app cancela la suscripción de Mercado Pago y borra los datos de la tienda y todas sus reglas. Si Tiendanube nos pide borrar los datos de una tienda, también se borran.</p>

      <h2>Tus derechos</h2>
      <p>Podés pedir acceso, corrección o borrado de tus datos escribiendo a <a href="mailto:martin.minghetti+tienda.nube@gmail.com">martin.minghetti+tienda.nube@gmail.com</a>. Respondemos dentro de los plazos de la Ley 25.326 de Protección de los Datos Personales. La Agencia de Acceso a la Información Pública, en su carácter de órgano de control de la Ley 25.326, tiene la atribución de atender las denuncias y reclamos que se interpongan con relación al incumplimiento de las normas sobre protección de datos personales.</p>

      <h2>Cambios</h2>
      <p>Si cambiamos esta política, actualizamos la fecha de arriba. Si el cambio afecta qué datos usamos, avisamos por e-mail a las tiendas que tengan la app instalada.</p>

      <hr />
      <p className="text-[var(--color-fg-muted)]"><a href={`${BASE_PATH}/soporte`}>Soporte</a></p>
    </LegalPage>
  );
}
