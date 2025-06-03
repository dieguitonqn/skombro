"use client";
import { useState } from "react";
import { useRef } from "react";

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
  // Estado para checkboxes y porcentajes editables
  const [checked, setChecked] = useState<{ [key: number]: boolean }>({});
  const [valorTotal, setValorTotal] = useState<number | null>(null);
  const [m2obra, setM2obra] = useState<number | null>(null);
  const [costoTotal, setCostoTotal] = useState<number | null>(null);
  // Inicializa los porcentajes editables con los valores por defecto de ITEMS
  const [editablePorcentajes, setEditablePorcentajes] = useState<{
    [key: number]: number;
  }>(Object.fromEntries(ITEMS.map((item) => [item.id, item.porcentaje])));

  const total = ITEMS.reduce((acc, item) => {
    const porcentaje = editablePorcentajes[item.id] ?? item.porcentaje;
    return (
      acc + (checked[item.id] ? (porcentaje / 100) * (costoTotal ?? 0) : 0)
    );
  }, 0);

  const handleCheck = (id: number) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };
  const handleCostoTotal = (valorTotal: number, m2obra: number) => {
    const costoTotal = valorTotal * m2obra;
    setCostoTotal(costoTotal);
  };
  const handlePorcentajeChange = (id: number, value: number) => {
    setEditablePorcentajes((prev) => ({ ...prev, [id]: value }));
  };

  const [showModal, setShowModal] = useState(false);
  const [cliente, setCliente] = useState({
    nombre: "",
    apellido: "",
    empresa: "",
    telefono: "",
    direccion: "",
    email: ""
  });
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const handleClienteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCliente({ ...cliente, [e.target.name]: e.target.value });
  };

  const handleInforme = async (e: React.FormEvent) => {
    e.preventDefault();
    // Prepara los datos a enviar
    const itemsSeleccionados = ITEMS.map((item) => {
      const porcentaje = editablePorcentajes[item.id] ?? item.porcentaje;
      const valorItem = costoTotal ? ((porcentaje / 100) * costoTotal) : 0;
      return {
        ...item,
        porcentaje: porcentaje,
        valor: valorItem,
        incluido: !!checked[item.id],
      };
    });
    const body = {
      cliente,
      valores: {
        valorTotal,
        m2obra,
        costoTotal,
        totalSeleccionado: total,
      },
      items: itemsSeleccionados,
    };
    // Llama a la API para generar el PDF
    const res = await fetch("/api/informe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    if (res.ok) {
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setShowModal(false);
    } else {
      alert("Error generando el informe PDF");
    }
  };

  return (
    <div className="w-full max-w-4xl m-10">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="flex flex-col">
          <label
        htmlFor="valorEstimado"
        className="mb-2 text-sm font-medium text-gray-200"
          >
        VALOR ESTIMADO OBRA X M² (US$)
          </label>
          <input
        id="valorEstimado"
        type="number"
        placeholder="Ej: 1200"
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-300 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          setValorTotal(isNaN(value) ? null : value);
          handleCostoTotal(value, m2obra ?? 0);
        }}
          />
        </div>
        <div className="flex flex-col">
          <label
        htmlFor="m2obra"
        className="mb-2 text-sm font-medium text-gray-200"
          >
        M² DE OBRA ESTIMADOS
          </label>
          <input
        id="m2obra"
        type="number"
        placeholder="Ej: 150"
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-300 placeholder-gray-400 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        onChange={(e) => {
          const value = parseFloat(e.target.value);
          setM2obra(isNaN(value) ? null : value);
          handleCostoTotal(valorTotal ?? 0, value);
        }}
          />
        </div>
        <div className="flex flex-col">
          <label
        htmlFor="costoTotal"
        className="mb-2 text-sm font-medium text-gray-200"
          >
        COSTO TOTAL OBRA (US$)
          </label>
          <input
        id="costoTotal"
        type="number"
        className="w-full p-3 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-700 cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
        value={costoTotal ?? ""}
        readOnly
        placeholder="Cálculo automático"
          />
        </div>
      </div>

      <table className="min-w-full border border-gray-300 rounded-lg overflow-hidden">
        <thead className="">
          <tr>
            <th className="p-2 border">Nombre</th>
            <th className="p-2 border">Descripción</th>
            <th className="p-2 border">% del total</th>
            <th className="p-2 border">Valor (US$)</th>
            <th className="p-2 border">Incluir</th>
          </tr>
        </thead>
        <tbody>
          {ITEMS.map((item) => {
            const porcentaje = editablePorcentajes[item.id] ?? item.porcentaje;
            const valorItem = costoTotal ? ((porcentaje / 100) * costoTotal) : 0;
            return (
              <tr key={item.id} className="">
                <td className="p-2 border">{item.nombre}</td>
                <td className="p-2 border">{item.descripcion}</td>
                <td className="p-2 border text-center">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    step={0.1}
                    value={editablePorcentajes[item.id] ?? item.porcentaje}
                    onChange={(e) =>
                      handlePorcentajeChange(
                        item.id,
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="w-20 p-1 border rounded text-center"
                  />
                </td>
                <td className="p-2 border text-center text-gray-300 font-semibold">
                  {valorItem > 0 ? `US$${valorItem.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : "-"}
                </td>
                <td className="p-2 border text-center">
                  <input
                    type="checkbox"
                    checked={!!checked[item.id]}
                    onChange={() => handleCheck(item.id)}
                    className="w-5 h-5 accent-blue-600"
                  />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-lg font-semibold text-right">
        Total seleccionado: <span className="text-blue-700">US${total}</span>
      </div>
      <div className="mt-8 flex flex-row gap-4 justify-end">
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded shadow"
          onClick={() => setShowModal(true)}
        >
          Hacer informe
        </button>
        {pdfUrl && (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded shadow"
          >
            Ver PDF generado
          </a>
        )}
      </div>

      {/* Modal para datos del cliente */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50">
          <form
            ref={formRef}
            onSubmit={handleInforme}
            className="bg-slate-200 text-black rounded-lg p-8 shadow-lg w-full max-w-md flex flex-col gap-4"
          >
            <h2 className="text-xl font-bold mb-2 text-gray-800">Datos del cliente</h2>
            <input name="nombre" placeholder="Nombre" value={cliente.nombre} onChange={handleClienteChange} className="p-2 border rounded" required />
            <input name="apellido" placeholder="Apellido" value={cliente.apellido} onChange={handleClienteChange} className="p-2 border rounded" required />
            <input name="empresa" placeholder="Empresa" value={cliente.empresa} onChange={handleClienteChange} className="p-2 border rounded" required />
            <input name="telefono" placeholder="Teléfono" value={cliente.telefono} onChange={handleClienteChange} className="p-2 border rounded" required  />
            <input name="direccion" placeholder="Dirección" value={cliente.direccion} onChange={handleClienteChange} className="p-2 border rounded" required />
            <input name="email" placeholder="Email" value={cliente.email} onChange={handleClienteChange} className="p-2 border rounded" required />
            <div className="flex flex-row gap-2 mt-4">
              <button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Generar PDF</button>
              <button type="button" className="bg-gray-400 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded" onClick={() => setShowModal(false)}>Cancelar</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
