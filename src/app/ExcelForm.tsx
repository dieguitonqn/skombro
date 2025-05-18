"use client";
import { useState } from "react";

interface Item {
  id: number;
  nombre: string;
  descripcion: string;
  porcentaje: number;
}

const ITEMS: Item[] = [
  {
    id: 1,
    nombre: "PROYECTO",
    descripcion:
      "Incluye: Anteproyecto, Planos grals y Calculo estructural (Modelo BIM (mep) / U$S 50 m2 + modelado para render / +7%/+10% sobre modelo)",
    porcentaje: 5,
  },
  {
    id: 2,
    nombre: "DIRECCION TECNICA",
    descripcion: "Incluye: Direccion tecnica de obra (2/3 visitas semanales)",
    porcentaje: 4,
  },
  {
    id: 3,
    nombre: "ANTEPROYECTO",
    descripcion: "Incluye: Documentacion gral, memoria descriptiva",
    porcentaje: 2,
  },
  {
    id: 4,
    nombre: "PLANO GRAL DE POYECTO",
    descripcion:
      "Incluye: Planos tecnicos de todos los rubros de la obra ( documentación / U$S 9m2 + modelado para render / +7%/+10% sobre modelo)",
    porcentaje: 3,
  },
  {
    id: 5,
    nombre: "ADMINISTRACION DE OBRA",
    descripcion:
      "Incluye: Comunicación con proveedores y contratistas y pago de los mismos",
    porcentaje: 3,
  },
  {
    id: 6,
    nombre: "CONFORME A OBRA",
    descripcion:
      "Incluye: Documentacion según obra y presentacion municipal (no incluye agrimensor)",
    porcentaje: 2,
  },
  {
    id: 7,
    nombre: "RELEVAMIENTO TECNICO",
    descripcion: "Incluye: Visita a obra, relevamiento tecnico con informe",
    porcentaje: 0, // Dia + Viaje
  },
  {
    id: 8,
    nombre: "REMODELACION/RESTAURACION",
    descripcion: "Incluye: Proyecto, direccion y conforme a obra",
    porcentaje: 8,
  },
  {
    id: 9,
    nombre: "DIA DE CAMPO",
    descripcion:
      "Incluye: Viaje hasta obra y relevamiento fotografico con infome",
    porcentaje: 0, // Dia + Viaje
  },
  {
    id: 10,
    nombre: "GESTION / TRAMITES",
    descripcion:
      "Incluye: Dia de gestion, viaje y presentacion de documentacion en entes (no incluye valor de planos)",
    porcentaje: 0, // Dia + Viaje
  },
  {
    id: 11,
    nombre: "VISITA DE OBRA / TALLERES",
    descripcion:
      "Incluye: Dia de gestion de proveedores y control de ejecucion",
    porcentaje: 0, // Dia + Viaje
  },
  {
    id: 12,
    nombre: "COMPUTO Y PRESUPUESTO",
    descripcion:
      "Incluye: Calculo de materiales para la obra y la necesidad en las distintas etapas de la obra",
    porcentaje: 1,
  },
  {
    id: 13,
    nombre: "DISEÑO DE INTERIORES",
    descripcion:
      "Incluye: Según requerimiento de comitente se estableceran alcances",
    porcentaje: 1, // 1%-3% (solo se puede poner un valor, puedes ajustar la lógica si quieres rangos)
  },
  {
    id: 14,
    nombre: "DISEÑO DE MOBILIARIO",
    descripcion:
      "Incluye: Según requerimiento de comitente se estableceran alcances",
    porcentaje: 1, // 1%-2%
  },
  {
    id: 15,
    nombre: "PAISAJISMO / PARQUES",
    descripcion:
      "Incluye: Incluye vegtacion mas acorde y tipo de riego necesario",
    porcentaje: 1,
  },
  {
    id: 16,
    nombre: "FIRMA DE DOCUMENTACION",
    descripcion:
      "Incluye: Firma de planos sin la adquisicion del proyecto, La sola firma atribuye un 50% de la direccion",
    porcentaje: 2,
  },
];

export default function ExcelForm() {
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});
  const [valorTotal, setValorTotal] = useState<number | null>(null);
  const [m2obra, setM2obra] = useState<number | null>(null);
  const [costoTotal, setCostoTotal] = useState<number | null>(null);

  const total = ITEMS.reduce(
    (acc, item) =>
      acc +
      (checked[item.id] ? (item.porcentaje / 100) * (costoTotal ?? 0) : 0),
    0
  );

  const handleCheck = (id: number) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleCostoTotal = (valorTotal: number, m2obra: number) => {
    const costoTotal = valorTotal * m2obra;
    setCostoTotal(costoTotal);
  };

  return (
    <div className="w-full max-w-4xl">
      <div className="flex flex-row items-center justify-between mb-4">
        US$
        <input
          type="number"
          placeholder="Ingrese el VALOR ESTIMADO DE LA OBRA X M2 (u$s)"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setValorTotal(isNaN(value) ? null : value);
            handleCostoTotal(value, m2obra ?? 0);
          }}
        />
        US$
        <input
          type="number"
          placeholder="Ingrese el M2 DE LA OBRA ESTIMADOS (u$s)"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          onChange={(e) => {
            const value = parseFloat(e.target.value);
            setM2obra(isNaN(value) ? null : value);
            handleCostoTotal(valorTotal ?? 0, value);
          }}
        />
        US$
        <input
          type="number"
          className="w-full p-2 border border-gray-300 rounded-lg mb-4"
          value={costoTotal ?? 0}
          readOnly
        />
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">% del total</th>
            <th className="p-2 border">Incluir</th>
          </tr>
        </thead>
        <tbody>
          {ITEMS.map((item) => (
            <tr key={item.id} className="">
              <td className="p-2 border">{item.nombre}</td>
              <td className="p-2 border">{item.descripcion}</td>
              <td className="p-2 border text-center">{item.porcentaje}%</td>
              <td className="p-2 border text-center">
                <input
                  type="checkbox"
                  checked={!!checked[item.id]}
                  onChange={() => handleCheck(item.id)}
                  className="w-5 h-5 accent-blue-600"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="mt-4 text-lg font-semibold text-right">
        Total seleccionado: <span className="text-blue-700">US${total}</span>
      </div>
    </div>
  );
}
