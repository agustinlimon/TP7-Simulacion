import { HTMLUtils } from './HTMLUtils';
import { Simulador } from './Simulador';
import { SimuladorColas } from './SimuladorColas';
import './style.css';

// Definición de los cuadros de texto de la interfaz de usuario.
const txtCantNros: HTMLInputElement = document.getElementById('txtCantNros') as HTMLInputElement;
const txtEventoDesde: HTMLInputElement = document.getElementById('txtEventoDesde') as HTMLInputElement;
const txtMediaLlegadaClientes: HTMLInputElement = document.getElementById('txtMediaLlegadaClientes') as HTMLInputElement;
const txtDesEstLlegadaClientes: HTMLInputElement = document.getElementById('txtDesEstLlegadaClientes') as HTMLInputElement;
const txtMediaFinEntregaPedido: HTMLInputElement = document.getElementById('txtMediaFinEntregaPedido') as HTMLInputElement;
const txtAFinConsumicionPedido: HTMLInputElement = document.getElementById('txtAFinConsumicionPedido') as HTMLInputElement;
const txtBFinConsumicionPedido: HTMLInputElement = document.getElementById('txtBFinConsumicionPedido') as HTMLInputElement;
const txtAFinUtilizacionMesa: HTMLInputElement = document.getElementById('txtAFinUtilizacionMesa') as HTMLInputElement;
const txtBFinUtilizacionMesa: HTMLInputElement = document.getElementById('txtBFinUtilizacionMesa') as HTMLInputElement;

const divTablaSimulacion: HTMLDivElement = document.getElementById('divTablaSimulacion') as HTMLDivElement;
const divRungeKutta: HTMLDivElement = document.getElementById('divRungeKutta') as HTMLDivElement;

// Definición de la tablas de simulación de colas.
const tablaSimulacion: HTMLTableElement = document.getElementById('tablaSimulacion') as HTMLTableElement;
const cantEncabezadosTablaSimulacion = tablaSimulacion.rows[0].cells.length;
const cantSubEncabezadosTablaSimulacion = tablaSimulacion.rows[1].cells.length;
const indicesEventosCandidatos: number[] = [6, 10, 16, 17, 22, 25];
const colPasajeros: string[] = ['ID Pasajero', 'Tipo Pasajero', 'Estado', 'Segundo llegada', 'Segundo Salida'];

// Definición de botones de la interfaz de usuario.
const btnSimular: HTMLButtonElement = document.getElementById('btnSimular') as HTMLButtonElement;
const btnRK: HTMLButtonElement = document.getElementById('btnRK') as HTMLButtonElement;

// Definición de los objetos que realizan la simulación de colas.
let simulador: Simulador;
let matrizEstado: string[][];
let cantMaxClientes: number;

// Definición de los parámetros.
let n: number;
let eventoDesde: number;
let mediaLlegadaClientes: number;
let DesviacionLlegadaClientes: number;
let mediaFinEntregaPedido: number;
let AFinConsumicionPedido: number;
let BFinConsumicionPedido: number;
let AFinUtilizacionMesa: number;
let BFinUtilizacionMesa: number;

//Ocultamos la seccion en donde esta la tabla.
HTMLUtils.ocultarSeccion(divTablaSimulacion);
HTMLUtils.ocultarSeccion(divRungeKutta);

// Disparamos la simulación.
btnSimular.addEventListener('click', () => {
  HTMLUtils.ocultarSeccion(divTablaSimulacion);
  HTMLUtils.ocultarSeccion(divRungeKutta);
  simular();
});

// Mostramos las tablas de Runge-Kutta.
btnRK.addEventListener('click', () => {
  mostrarRK();
});

const mostrarRK = () => {
  divRungeKutta.innerHTML = '';
  HTMLUtils.mostrarSeccion(divRungeKutta);
  let rkCafe: Array<number[][]> = simulador.getRKCafe();
  let rkCafeYMedialuna: Array<number[][]> = simulador.getRKCafeYMedialuna();
  let rkMenu: Array<number[][]> = simulador.getRKMenu();

  if (rkCafe.length > 0) {
    divRungeKutta.innerHTML += '<h1 class="text-center">Tabla de Runge-Kutta Cafe:</h1>';
    for (let i: number = 0; i < rkCafe.length; i++) {
      let tabla: string = HTMLUtils.crearTablaRK(rkCafe[i], 'P');
      divRungeKutta.innerHTML += tabla;
    }
  }

  if (rkCafeYMedialuna.length > 0) {
    divRungeKutta.innerHTML += '<h1 class="text-center">Tabla de Runge-Kutta Cafe y Medialuna:</h1>';
    for (let i: number = 0; i < rkCafeYMedialuna.length; i++) {
      let tabla: string = HTMLUtils.crearTablaRK(rkCafeYMedialuna[i], 'P');
      divRungeKutta.innerHTML += tabla;
    }
  }

  if (rkMenu.length > 0) {
    divRungeKutta.innerHTML += '<h1 class="text-center">Tabla de Runge-Kutta Menu:</h1>';
    for (let i: number = 0; i < rkMenu.length; i++) {
      let tabla: string = HTMLUtils.crearTablaRK(rkMenu[i], 'P');
      divRungeKutta.innerHTML += tabla;
    }
  }
}

const simular = () => {
  // Validamos los parámetros ingresados por el usuario.
  if (!validarParametros()) return;

      HTMLUtils.limpiarTablaSimulacion(tablaSimulacion, cantEncabezadosTablaSimulacion, cantSubEncabezadosTablaSimulacion);

      // Realizamos la simulación.
      simulador = new SimuladorColas();
      simulador.simular(n, eventoDesde, mediaLlegadaClientes, DesviacionLlegadaClientes, mediaFinEntregaPedido, AFinConsumicionPedido, BFinConsumicionPedido, AFinUtilizacionMesa, BFinUtilizacionMesa);

      matrizEstado = simulador.getMatrizEstado();
      cantMaxClientes = simulador.getCantMaxClientesEnSistema();

      // Cargamos la tabla a mostrar.
      HTMLUtils.completarEncabezadosClientes(cantMaxClientes, tablaSimulacion, colPasajeros);
      HTMLUtils.llenarTablaSimulacion(matrizEstado, indicesEventosCandidatos, tablaSimulacion);
      HTMLUtils.mostrarSeccion(divTablaSimulacion);
}

// Validación de los parámetros del usuario.
function validarParametros(): boolean {
  if (txtCantNros.value === '' || txtEventoDesde.value === '') {
    alert('Tiene que ingresar todos los parámetros solicitados.');
    return false;
  }

  n = Number(txtCantNros.value);
  eventoDesde = Number(txtEventoDesde.value);
  mediaLlegadaClientes = Number(txtMediaLlegadaClientes.value);
  DesviacionLlegadaClientes = Number(txtDesEstLlegadaClientes.value);
  mediaFinEntregaPedido = Number(txtMediaFinEntregaPedido.value);
  AFinConsumicionPedido = Number(txtAFinConsumicionPedido.value);
  BFinConsumicionPedido = Number(txtBFinConsumicionPedido.value);
  AFinUtilizacionMesa = Number(txtAFinUtilizacionMesa.value);
  BFinUtilizacionMesa = Number(txtBFinUtilizacionMesa.value);

  if (n <= 0) {
    alert('La cantidad de eventos a generar debe ser mayor a cero.');
    return false;
  }
  if (eventoDesde < 0 || eventoDesde > n) {
    alert('El evento desde ingresado debe estar comprendido entre 0 y ' + n + '.');
    return false;
  }
  if (mediaLlegadaClientes < 0 || mediaFinEntregaPedido < 0) {
    alert('La media no puede ser un valor negativo.');
    return false;
  }
  if (AFinConsumicionPedido >= BFinConsumicionPedido || AFinUtilizacionMesa  >= BFinUtilizacionMesa) {
    alert('El valor de "B" debe ser mayor a "A".');
    return false;
  }
  if (DesviacionLlegadaClientes < 0){
    alert('La desviación estándar no puede ser un valor negativo.');
    return false;
  }
  return true;
}