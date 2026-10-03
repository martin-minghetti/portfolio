import type { Metadata } from "next";
import { LegalPage, BASE_PATH } from "../Legal";

export const metadata: Metadata = {
  title: "Soporte · Ocultar Envíos y Pagos",
  alternates: { canonical: `${BASE_PATH}/soporte` },
};

export default function SoportePage() {
  return (
    <LegalPage>
      <h1>Soporte</h1>
      <p className="text-[var(--color-fg-muted)]">Ocultar Envíos y Pagos, de Mingo</p>

      <h2>Cómo contactarnos</h2>
      <p>Escribinos a <a href="mailto:martin.minghetti+tienda.nube@gmail.com">martin.minghetti+tienda.nube@gmail.com</a>.</p>
      <ul>
        <li>Atención: lunes a viernes de 8 a 12 hs (hora de Argentina).</li>
        <li>Respondemos dentro de las 24 horas hábiles.</li>
        <li>Para ayudarte más rápido, incluí la dirección de tu tienda y, si es sobre una regla, qué producto o monto tenía el carrito.</li>
      </ul>

      <h2>Antes de escribir</h2>
      <ul>
        <li><strong>Probar una regla:</strong> en la app, la sección Simulador muestra qué envíos y medios de pago quedarían para un carrito de prueba.</li>
        <li><strong>Si algo falla:</strong> la app nunca bloquea una venta. Si no puede responder a tiempo, tu tienda muestra todos los envíos y medios de pago, como si la app no estuviera.</li>
        <li><strong>Dar de baja:</strong> desinstalar la app desde el administrador de Tiendanube cancela la suscripción y borra tus reglas.</li>
      </ul>

      <hr />
      <p className="text-[var(--color-fg-muted)]"><a href={`${BASE_PATH}/privacidad`}>Política de privacidad</a></p>
    </LegalPage>
  );
}
