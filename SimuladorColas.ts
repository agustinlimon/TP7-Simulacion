import { Evento } from "./Evento";
import { Empleado } from "./Empleado";
import { Cliente } from "./Cliente";
import { EstadoCliente } from "./EstadoCliente";
import { Simulador } from "./Simulador";
import { Utils } from "./Utils";

export class SimuladorColas extends Simulador { 
  public simular(
    cantEventos: number,
    eventoDesde: number,
    mediaLlegadaClientes: number, 
    DesviacionLlegadaClientes: number, 
    mediaFinEntregaPedido: number, 
    AFinConsumicionPedido: number, 
    BFinConsumicionPedido: number, 
    AFinUtilizacionMesa: number, 
    BFinUtilizacionMesa: number): void {
    
    this.probTiposClientes = [0.3, 0.5, 1];
    this.probOcupaMesa = [0.5, 1];
    this.probTiposPedidos = [0.33, 0.66, 1];

    this.mediaTiempoEntreLlegadas = mediaLlegadaClientes;
    this.desviacionTiempoEntreLlegada = DesviacionLlegadaClientes;
    this.mediaTiempoEntregaPedido = mediaFinEntregaPedido;
    this.aTiempoConsumicionPedido = AFinConsumicionPedido;
    this.bTiempoConsumicionPedido = BFinConsumicionPedido;
    this.aTiempoUtilizacionMesa = AFinUtilizacionMesa;
    this.bTiempoUtilizacionMesa = BFinUtilizacionMesa;

    this.matrizEstado = [];

    // Definimos el rango de filas que vamos a mostrar.
    let indiceHasta: number = eventoDesde + 399;
    if (indiceHasta > cantEventos - 1)
      indiceHasta = cantEventos;

    // Vector de estado.
    let evento: string[] = [];

    let tipoEvento: Evento;
    let reloj: number = 0;

    // Llegada de un pasajero.
    let rnd1Llegada: number = -1;
    let rnd2Llegada: number = -1;
    let tiempoEntreLlegadas: number = -1;
    let proximaLlegada: number = -1;
    let rndTipoCliente: number = -1;
    let tipoCliente: string = '';

    // Compra Ticket.
    let tiempoCaja: number = -1;
    let finCaja: number = -1;
    let rndOcupaMesa: number = -1;
    let ocupaMesa: string = '';

    // Preparacion Comida.
    let rndTiempoEntrega: number = -1;
    let tiempoEntrega: number = -1;
    let rndTipoPedido: number = -1;
    let tipoPedido: string = '';
    let tiempoPreparacion: number = -1;
    let finPreparacion1: number = -1;
    let finPreparacion2: number = -1;

    // Consumicion Comida.
    let rndConsumicion: number = -1;
    let tiempoConsumicion: number = -1;
    let finConsumicion: number = -1;

    // Utilizacion Mesa.
    let rndUtilizacionMesa: number = -1;
    let tiempoUtilizacionMesa: number = -1;
    let finUtilizacionMesa: number = -1;

    // Empleado Caja.
    let empleadoCaja = new Empleado();
    let colaCaja: Cliente[] = [];

    // Empleados Preparacion.
    let empleadoPreparacion1 = new Empleado();
    let empleadoPreparacion2 = new Empleado();
    let colaPreparacion: Cliente[] = [];

    // Pasajeros en el sistema.
    let clientesEnSistema: Cliente[] = [];

    // Métricas.
    let totalClientesA: number = 0;
    let totalClientesB: number = 0;
    let totalClientesC: number = 0;
    let totalClientes: number = 0;
    let acuTiempoClientes: number = 0;
    let segTiempoOciosoEmpCajaDesde: number = 0;
    let acuTiempoOciosoEmpCaja: number = 0;
    let cantMaxCliEnColaPrep: number = 0;

    this.cantMaxClientes = 0;  
    
    for (let i: number = 0; i < cantEventos; i++) {
      evento = [];
      // Determinamos el tipo de evento.
      if (i == 0) {
        tipoEvento = Evento.INICIO_SIMULACION;
      }
      else if (i == cantEventos - 1) {
        tipoEvento = Evento.FIN_SIMULACION;
      }
      else {
        let eventosCandidatos: number[] = [
          proximaLlegada,
          finCaja,
          finPreparacion1,
          finPreparacion2,
        ];
        for (let i: number = 0; i < clientesEnSistema.length; i++) {
          let cliente: Cliente = clientesEnSistema[i];
          eventosCandidatos.push(
            cliente.segundoSalidaSistema
          );
        }
        reloj = Utils.getMenorMayorACero(eventosCandidatos);
        tipoEvento = this.getSiguienteEvento(eventosCandidatos);
      }

      switch (tipoEvento) {
        // Inicio de la simulación.
        case Evento.INICIO_SIMULACION: {
          rnd1Llegada = Math.random();
          rnd2Llegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rnd1Llegada, rnd2Llegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);
          break;
        }

        // Llegada de un cliente.
        case Evento.LLEGADA_CLIENTE: {
          // Obtenemos el tipo de cliente.
          rndTipoCliente = Math.random();
          tipoCliente = this.getTipoCliente(rndTipoCliente, ["A", "B", "C"]);
          totalClientes++;

          // Generamos la llegada del próximo cliente.
          rnd1Llegada = Math.random();
          rnd2Llegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rnd1Llegada, rnd2Llegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);

          // Creamos el objeto cliente.
          let cliente: Cliente = new Cliente(
            totalClientes,
            tipoCliente,
            reloj
          );

          clientesEnSistema.push(cliente);
          switch (tipoCliente) {
            // Llega un cliente de tipo A. Va a comprar algo.
            case "A": {
              totalClientesA++;
              if (empleadoCaja.estaLibre()) {
                cliente.comprandoComida();
                empleadoCaja.ocupado();
  
                // El tiempo de atencion es constante.
                tiempoCaja = 45;
                finCaja = (reloj + tiempoCaja);
              }
              else {
                cliente.enEsperaCompra();
                colaCaja.push(cliente);
              }
              break;
            }
  
            // Llega un pasajero de tipo B. Va a utilizar una mesa.
            case "B": {
              totalClientesB++;  

              // Generamos el tiempo de Utilizacion de la mesa.
              rndUtilizacionMesa = Math.random();
              tiempoUtilizacionMesa = this.getTiempoUtilizacionMesa(rndUtilizacionMesa);
              finUtilizacionMesa = (reloj + tiempoUtilizacionMesa);
              cliente.segundoSalidaSistema = finUtilizacionMesa
              break;
            }
  
            // Llega un cliente de tipo C. Esta de pasada
            case "C": {
              totalClientesC++;
              break;
            }
          }
          break;
        }

        // Fin de Compra Ticket.
        case Evento.FIN_CAJA: {
          finCaja = -1;
          // Preguntamos si hay alguien en la cola.
          if (colaCaja.length === 0) {
            empleadoCaja.libre();
          }
          else {
            // El servidor pasa de ocupado a ocupado.
            empleadoCaja.ocupado();
            colaCaja.shift().comprandoComida();

            // Generamos el tiempo de facturación.
            tiempoCaja = 45;
            finCaja = (reloj + tiempoCaja);
          }

          let clienteAtendido: Cliente = clientesEnSistema.find(cli => cli.getEstado() === EstadoCliente.COMPRANDO_COMIDA);
          if (empleadoPreparacion1.estaLibre()){
            clienteAtendido.siendoAtendidoEmp1();
            empleadoPreparacion1.ocupado();

            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);

            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);

            switch (tipoPedido) {
              // Llega un cliente de tipo A. Va a comprar algo.
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                this.rkCafe.push(this.rungeKutta.getMatrizRK());
                break;
              }
      
              // Llega un pasajero de tipo B. Va a utilizar una mesa.
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                break;
              }
      
              // Llega un cliente de tipo C. Esta de pasada
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                this.rkMenu.push(this.rungeKutta.getMatrizRK());
                break;
              }
            }
            finPreparacion1 = tiempoEntrega + tiempoPreparacion;

            //Calculamos si va a usar una mesa
            rndOcupaMesa = Math.random();
            ocupaMesa = this.getOcupacionMesa(rndOcupaMesa, ["SI", "NO"]);
            if (ocupaMesa === "SI"){
              rndConsumicion = Math.random();
              tiempoConsumicion = this.getTiempoConsumicionPedido(rndConsumicion);
              finConsumicion = finPreparacion1 + tiempoConsumicion;
              clienteAtendido.segundoSalidaSistema = finConsumicion;
            }
            else {
              clienteAtendido.segundoSalidaSistema = finPreparacion1;
            }
          }
          else if (empleadoPreparacion2.estaLibre()){
            clienteAtendido.siendoAtendidoEmp2();
            empleadoPreparacion2.ocupado();

            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);

            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);

            switch (tipoPedido) {
              // Llega un cliente de tipo A. Va a comprar algo.
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                this.rkCafe.push(this.rungeKutta.getMatrizRK());
                break;
              }
      
              // Llega un pasajero de tipo B. Va a utilizar una mesa.
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                break;
              }
      
              // Llega un cliente de tipo C. Esta de pasada
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                this.rkMenu.push(this.rungeKutta.getMatrizRK());
                break;
              }
            }
            finPreparacion2 = tiempoEntrega + tiempoPreparacion;

            //Calculamos si va a usar una mesa
            rndOcupaMesa = Math.random();
            ocupaMesa = this.getOcupacionMesa(rndOcupaMesa, ["SI", "NO"]);
            if (ocupaMesa === "SI"){
              rndConsumicion = Math.random();
              tiempoConsumicion = this.getTiempoConsumicionPedido(rndConsumicion);
              finConsumicion = finPreparacion2 + tiempoConsumicion;
              clienteAtendido.segundoSalidaSistema = finConsumicion;
            }
            else {
              clienteAtendido.segundoSalidaSistema = finPreparacion2;
            }
          }
          else {
            clienteAtendido.enEsperaPreparacion();
            colaPreparacion.push(clienteAtendido);
          }
          break;
        }

        // Fin de Preparacion del Empleado 1.
        case Evento.FIN_ENTREGA_1: {
          finPreparacion1 = -1;
          // Buscamos el cliente atendido y le cambiamos el estado.
          let clienteAtendido: Cliente = clientesEnSistema.find(cli => cli.getEstado() === EstadoCliente.SIENDO_ATENDIDO_EMP1);
          clienteAtendido.pasandoDeVentaAFacturacion();
          pasajeroAtendido.minutoLlegadaDeVentaAFacturacion = finPaseEntreVentaYFacturacion;
          // Preguntamos si hay alguien en la cola.
          if (colaVentaBillete.length === 0) {
            empleadoVentaBillete.libre();
          }
          else {
            empleadoVentaBillete.ocupado();
            // Quitamos a un pasajero de la cola y cambiamos su estado.
            colaVentaBillete.shift().comprandoBillete();
            // Generamos el tiempo de venta de billete.
            rndVentaBillete = Math.random();
            tiempoVentaBillete = this.getTiempoVentaBillete(rndVentaBillete);
            finVentaBillete = (reloj + tiempoVentaBillete);
          }
          break;
        }

        // Fin de chequeo de billete a un pasajero.
        case Evento.FIN_CHEQUEO_BILLETE: {
          finChequeoBillete = -1;
          // Se genera el tiempo que tardará el pasajero atendido en pasar a la zona de control de metales.
          rndPaseEntreChequeoYControl = Math.random();
          tiempoPaseEntreChequeoYControl = this.getTiempoPasoEntreZonas(rndPaseEntreChequeoYControl);
          finPaseEntreChequeoYControl = (reloj + tiempoPaseEntreChequeoYControl);
          // Buscamos el pasajero atendido y le cambiamos el estado.
          let pasajeroAtendido: Pasajero = pasajerosEnSistema.find(pasajero => pasajero.getEstado() === EstadoPasajero.CHEQUEANDO_BILLETE);
          pasajeroAtendido.pasandoDeChequeoAControl();
          pasajeroAtendido.minutoLlegadaDeChequeoBilleteAControl = finPaseEntreChequeoYControl;

          // Preguntamos si hay alguien en la cola.
          if (colaChequeoBillete.length === 0) {
            empleadoChequeoBillete.libre();
          }
          else {
            empleadoChequeoBillete.ocupado();
            // Quitamos a un pasajero de la cola y cambiamos su estado.
            colaChequeoBillete.shift().chequeandoBillete();
            // Generamos el tiempo de Chequeo de billete.
            rnd1ChequeoBillete = Math.random();
            rnd2ChequeoBillete = Math.random();
            tiempoChequeoBillete = this.getTiempoChequeoBillete(rnd1ChequeoBillete, rnd2ChequeoBillete);
            finChequeoBillete = (reloj + tiempoChequeoBillete);
          }
          break;
        }

        // Fin de simulación.
        case Evento.FIN_SIMULACION: {
          // Calculamos el tiempo de permanencia en el sistema de los pasajeros que quedaron en el sistema.
          for (let i: number = 0; i < clientesEnSistema.length; i++) {
            acuTiempoClientes += reloj - clientesEnSistema[i].getSegundoLlegada();
          }
          break;
        }
      }

      // Cargamos la matriz de estado a mostrar solo para el rango pasado por parámetro.
      if ((i >= eventoDesde && i <= indiceHasta) || i == cantEventos-1) {
        evento.push(
          i.toString(),
          Evento[tipoEvento],
          reloj.toFixed(4),

          rndValorbeta.toFixed(4),
          tiempoEntreBloqueos.toFixed(4),
          proximoBloqueo.toFixed(4),
          rndObjetivoBloqueo.toFixed(4),
          objetivoBloqueo,
    
          rndLlegada.toFixed(4),
          tiempoEntreLlegadas.toFixed(4),
          proximaLlegada.toFixed(4),
          rndTipoPasajero.toFixed(4),
          tipoPasajero,

          tiempoBloqueoCliente.toFixed(4),
          finBloqueoCliente.toFixed(4),
    
          rndFacturacion.toFixed(4),
          tiempoFacturacion.toFixed(4),
          finFacturacion.toFixed(4),
    
          rndVentaBillete.toFixed(4),
          tiempoVentaBillete.toFixed(4),
          finVentaBillete.toFixed(4),
    
          rnd1ChequeoBillete.toFixed(4),
          rnd2ChequeoBillete.toFixed(4),
          tiempoChequeoBillete.toFixed(4),
          finChequeoBillete.toFixed(4),

          tiempoBloqueoEmpleadoChequeo.toFixed(4),
          finBloqueoEmpleadoChequeo.toFixed(4),
    
          rndControlMetales.toFixed(4),
          tiempoControlMetales.toFixed(4),
          finControlMetales.toFixed(4),
    
          rndPaseEntreVentaYFacturacion.toFixed(4),
          tiempoPaseEntreVentaYFacturacion.toFixed(4),
          finPaseEntreVentaYFacturacion.toFixed(4),
    
          rndPaseEntreFacturacionYControl.toFixed(4),
          tiempoPaseEntreFacturacionYControl.toFixed(4),
          finPaseEntreFacturacionYControl.toFixed(4),
    
          rndPaseEntreChequeoYControl.toFixed(4),
          tiempoPaseEntreChequeoYControl.toFixed(4),
          finPaseEntreChequeoYControl.toFixed(4),
    
          rndPaseEntreControlYEmbarque.toFixed(4),
          tiempoPaseEntreControlYEmbarque.toFixed(4),
          finPaseEntreControlYEmbarque.toFixed(4),

          colaPasajerosBloqueadosEnIngreso.length.toString(),
    
          empleadoFacturacion.getEstado(),
          colaFacturacion.length.toString(),
    
          empleadoVentaBillete.getEstado(),
          colaVentaBillete.length.toString(),
    
          empleadoChequeoBillete.getEstado(),
          colaChequeoBillete.length.toString(),
          tiempoRemanenteChequeo.toFixed(4),
    
          empleadoControlMetales.getEstado(),
          colaControlMetales.length.toString(),
    
          totalPasajerosA.toString(),
          totalPasajerosB.toString(),
          totalPasajerosC.toString(),
          totalPasajeros.toString(),
          acuTiempoPasajeros.toFixed(4),
          acuTiempoOciosoEmpControl.toFixed(4),
          cantPasajerosAtentidosPorVenta.toString(),
          cantMaxPasajerosEnAlgunaCola.toString(),
          cantMaxPasajerosEnColaControl.toString()
        );
    
        for (let i: number = 0; i < clientesEnSistema.length; i++) {
          evento.push(
            clientesEnSistema[i].getId().toString(),
            clientesEnSistema[i].getTipoPasajero(),
            EstadoPasajero[pasajerosEnSistema[i].getEstado()],
            clientesEnSistema[i].getMinutoLlegada().toFixed(4),
            clientesEnSistema[i].minutoLlegadaDeVentaAFacturacion.toFixed(4),
          );
        }

        this.matrizEstado.push(evento);

        // Actualizamos la cantidad de pasajeros máximos que hubo en el sistema.
        if (clientesEnSistema.length > this.cantMaxClientes)
          this.cantMaxClientes = clientesEnSistema.length;
      }

      // Reseteamos algunas variables.
      rndValorbeta = -1;
      tiempoEntreBloqueos = -1;
      rndObjetivoBloqueo = -1;
      objetivoBloqueo = "";
      rndLlegada = -1;
      tiempoEntreLlegadas = -1;
      rndTipoPasajero = -1;
      tipoPasajero = "";
      tiempoBloqueoCliente = -1;
      rndFacturacion = -1;
      tiempoFacturacion = -1;
      rndVentaBillete = -1;
      tiempoVentaBillete = -1;
      rnd1ChequeoBillete = -1;
      rnd2ChequeoBillete = -1;
      tiempoChequeoBillete = -1;
      tiempoBloqueoEmpleadoChequeo = -1;
      rndControlMetales = -1;
      tiempoControlMetales = -1;
      rndPaseEntreVentaYFacturacion = -1;
      tiempoPaseEntreVentaYFacturacion = -1;
      rndPaseEntreFacturacionYControl = -1;
      tiempoPaseEntreFacturacionYControl = -1;
      rndPaseEntreChequeoYControl = -1;
      tiempoPaseEntreChequeoYControl = -1;
      rndPaseEntreControlYEmbarque = -1;
      tiempoPaseEntreControlYEmbarque = -1;



    }
  }

  public getSiguienteEvento(tiemposEventos: number[]): Evento {
    let menor: number = Utils.getMenorMayorACero(tiemposEventos);
    for (let i: number = 0; i < tiemposEventos.length; i++) {
      if (tiemposEventos[i] === menor) {
        if (i < 4) return Evento[Evento[i+1]];
        else {
          return Evento.SALIDA_CLIENTE;
        }
      }
    }
    return -1;
  }
}