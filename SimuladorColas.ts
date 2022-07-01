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
    let acuTiempoClientes: number = 0;
    let segTiempoOciosoEmpCaja: number = 0;
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
          finConsumicion,
          finUtilizacionMesa
        ];

        reloj = Utils.getMenorMayorACero(eventosCandidatos);
        tipoEvento = this.getSiguienteEvento(eventosCandidatos);
      }

      switch (tipoEvento) {
        // Inicio de la simulación.
        case Evento.INICIO_SIMULACION: {
          /*rndValorbeta = Math.random();
          tiempoEntreBloqueos = this.rungeKutta.getTiempoEntreAtentados(0, this.relojEnOchentaLlegadas, 0.01, rndValorbeta);
          this.rkAtentados.push(this.rungeKutta.getMatrizRK());
          proximoBloqueo = (reloj + tiempoEntreBloqueos);*/

          rnd1Llegada = Math.random();
          rnd2Llegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rnd1Llegada, rnd2Llegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);
          break;
        }

        // Llegada de un bloqueo.
        case Evento.LLEGADA_BLOQUEO: {
          proximoBloqueo = -1;
          rndObjetivoBloqueo = Math.random();
          objetivoBloqueo = this.getObjetivoBloqueo(rndObjetivoBloqueo);

          switch (objetivoBloqueo) {
            case "Cliente": {
              tiempoBloqueoCliente = this.rungeKutta.getTiempoBloqueoCliente(0, reloj, 0.1);
              this.rkFinesBloqueoCliente.push(this.rungeKutta.getMatrizRK());
              finBloqueoCliente = (reloj + tiempoBloqueoCliente);
              estaBloqueadaLaEntrada = true;
              break;
            }
            case "Empleado Chequeo": {
              tiempoBloqueoEmpleadoChequeo = this.rungeKutta.getTiempoBloqueoServidor(0, reloj, 0.01);
              this.rkFinesBloqueoServidor.push(this.rungeKutta.getMatrizRK());
              finBloqueoEmpleadoChequeo = (reloj + tiempoBloqueoEmpleadoChequeo);
              if (empleadoChequeoBillete.estaOcupado()) {
                let pasajeroABloquear: Pasajero = pasajerosEnSistema.find(pasajero => pasajero.getEstado() === EstadoPasajero.CHEQUEANDO_BILLETE);
                pasajeroABloquear.bloqueadoEnChequeo();

                tiempoRemanenteChequeo = (finChequeoBillete - reloj);
                finChequeoBillete = -1;
              }
              empleadoChequeoBillete.bloqueado();
              break;
            }
          }
          break;
        }

        // Llegada de un pasajero.
        case Evento.LLEGADA_PASAJERO: {
          // Obtenemos el tipo de pasajero.
          rndTipoPasajero = Math.random();
          tipoPasajero = this.getTipoPasajero(rndTipoPasajero, ["A", "B", "C"]);
          totalPasajeros++;

          // Generamos la llegada del próximo pasajero.
          rndLlegada = Math.random();
          tiempoEntreLlegadas = this.getTiempoEntreLlegadas(rndLlegada);
          proximaLlegada = (reloj + tiempoEntreLlegadas);

          // Creamos el objeto pasajero.
          let pasajero: Pasajero = new Pasajero(
            totalPasajeros,
            tipoPasajero,
            reloj
          );

          pasajerosEnSistema.push(pasajero);

          // Preguntamos si hay un bloqueo de la entrada del aeropuerto en curso.
          if (estaBloqueadaLaEntrada) {
            pasajero.bloqueadoEnEntrada();
            colaPasajerosBloqueadosEnIngreso.push(pasajero);
          }
          else {
            switch (tipoPasajero) {
              // Llega un pasajero de tipo A. Va primero a la ventanilla de facturación de equipaje.
              case "A": {
                totalPasajerosA++;
                if (empleadoFacturacion.estaLibre()) {
                  pasajero.facturandoEquipaje();
                  empleadoFacturacion.ocupado();
  
                  // Generamos el tiempo de facturación.
                  rndFacturacion = Math.random();
                  tiempoFacturacion = this.getTiempoFacturacion(rndFacturacion);
                  finFacturacion = (reloj + tiempoFacturacion);
                }
                else {
                  pasajero.enEsperaFacturacion();
                  colaFacturacion.push(pasajero);
                }
                break;
              }
  
              // Llega un pasajero de tipo B. Va primero a la ventanilla de venta de billetes.
              case "B": {
                cantPasajerosAtentidosPorVenta++
                totalPasajerosB++;
                if (empleadoVentaBillete.estaLibre()) {
                  pasajero.comprandoBillete();
                  empleadoVentaBillete.ocupado();
  
                  // Generamos el tiempo de venta de billete.
                  rndVentaBillete = Math.random();
                  tiempoVentaBillete = this.getTiempoVentaBillete(rndVentaBillete);
                  finVentaBillete = (reloj + tiempoVentaBillete);
                }
                else {
                  pasajero.enEsperaCompraBillete();
                  colaVentaBillete.push(pasajero);
                }
                break;
              }
  
              // Llega un pasajero de tipo C. Va primero a la ventanilla de chequeo de billetes.
              case "C": {
                totalPasajerosC++;
                if (empleadoChequeoBillete.estaLibre()) {
                  pasajero.chequeandoBillete();
                  empleadoChequeoBillete.ocupado();
  
                  // Generamos el tiempo de chequeo de billete.
                  rnd1ChequeoBillete = Math.random();
                  rnd2ChequeoBillete = Math.random();
                  tiempoChequeoBillete = this.getTiempoChequeoBillete(rnd1ChequeoBillete, rnd2ChequeoBillete);
                  finChequeoBillete = (reloj + tiempoChequeoBillete);
                }
                else {
                  pasajero.enEsperaChequeoBilletes();
                  colaChequeoBillete.push(pasajero);
                }
                break;
              }
            }
          }
          break;
        }

        // Fin de bloqueo de la puerta del aeropuerto.
        case Evento.FIN_BLOQUEO_LLEGADA: {
          finBloqueoCliente = -1;

          // Generamos la llegada del siguiente bloqueo.
          rndValorbeta = Math.random();
          tiempoEntreBloqueos = this.rungeKutta.getTiempoEntreAtentados(0, this.relojEnOchentaLlegadas, 0.01, rndValorbeta);
          this.rkAtentados.push(this.rungeKutta.getMatrizRK());
          proximoBloqueo = (reloj + tiempoEntreBloqueos);

          estaBloqueadaLaEntrada = false;
          let tamColaPasajeros: number = colaPasajerosBloqueadosEnIngreso.length;

          if (tamColaPasajeros > 0) {
            // Mandamos todos los pasajeros bloqueados en el ingreso a sus respectivas zonas.
            for (let i: number = 0; i < tamColaPasajeros; i++) {
              let pasajero: Pasajero = colaPasajerosBloqueadosEnIngreso.shift();
              // Determinamos el tipo de pasajero.
              switch (pasajero.getTipoPasajero()) {
                // Llega un pasajero de tipo A. Va primero a la ventanilla de facturación de equipaje.
                case "A": {
                  totalPasajerosA++;
                  if (empleadoFacturacion.estaLibre()) {
                    pasajero.facturandoEquipaje();
                    empleadoFacturacion.ocupado();
    
                    // Generamos el tiempo de facturación.
                    rndFacturacion = Math.random();
                    tiempoFacturacion = this.getTiempoFacturacion(rndFacturacion);
                    finFacturacion = (reloj + tiempoFacturacion);
                  }
                  else {
                    pasajero.enEsperaFacturacion();
                    colaFacturacion.push(pasajero);
                  }
                  break;
                }
    
                // Llega un pasajero de tipo B. Va primero a la ventanilla de venta de billetes.
                case "B": {
                  cantPasajerosAtentidosPorVenta++
                  totalPasajerosB++;
                  if (empleadoVentaBillete.estaLibre()) {
                    pasajero.comprandoBillete();
                    empleadoVentaBillete.ocupado();
    
                    // Generamos el tiempo de venta de billete.
                    rndVentaBillete = Math.random();
                    tiempoVentaBillete = this.getTiempoVentaBillete(rndVentaBillete);
                    finVentaBillete = (reloj + tiempoVentaBillete);
                  }
                  else {
                    pasajero.enEsperaCompraBillete();
                    colaVentaBillete.push(pasajero);
                  }
                  break;
                }
    
                // Llega un pasajero de tipo C. Va primero a la ventanilla de chequeo de billetes.
                case "C": {
                  totalPasajerosC++;
                  if (empleadoChequeoBillete.estaLibre()) {
                    pasajero.chequeandoBillete();
                    empleadoChequeoBillete.ocupado();
    
                    // Generamos el tiempo de chequeo de billete.
                    rnd1ChequeoBillete = Math.random();
                    rnd2ChequeoBillete = Math.random();
                    tiempoChequeoBillete = this.getTiempoChequeoBillete(rnd1ChequeoBillete, rnd2ChequeoBillete);
                    finChequeoBillete = (reloj + tiempoChequeoBillete);
                  }
                  else {
                    pasajero.enEsperaChequeoBilletes();
                    colaChequeoBillete.push(pasajero);
                  }
                  break;
                }
              }
            }   
          }
          break;
        }

        // Fin de facturación de un pasajero.
        case Evento.FIN_FACTURACION: {
          finFacturacion = -1;
          // Se genera el tiempo que tardará el pasajero atendido en pasar a la zona de control de metales.
          rndPaseEntreFacturacionYControl = Math.random();
          tiempoPaseEntreFacturacionYControl = this.getTiempoPasoEntreZonas(rndPaseEntreFacturacionYControl);
          finPaseEntreFacturacionYControl = (reloj + tiempoPaseEntreFacturacionYControl);
          // Buscamos el pasajero atendido y le cambiamos el estado.
          let pasajeroAtendido: Pasajero = pasajerosEnSistema.find(pasajero => pasajero.getEstado() === EstadoPasajero.FACTURANDO_EQUIPAJE);
          pasajeroAtendido.pasandoDeFacturacionAControl();
          pasajeroAtendido.minutoLlegadaDeFacturacionAControl = finPaseEntreFacturacionYControl;
          // Preguntamos si hay alguien en la cola.
          if (colaFacturacion.length === 0) {
            empleadoFacturacion.libre();
          }
          else {
            // El servidor pasa de ocupado a ocupado.
            empleadoFacturacion.ocupado();

            // Quitamos a un pasajero de la cola y cambiamos su estado.
            colaFacturacion.shift().facturandoEquipaje();
            // Generamos el tiempo de facturación.
            rndFacturacion = Math.random();
            tiempoFacturacion = this.getTiempoFacturacion(rndFacturacion);
            finFacturacion = (reloj + tiempoFacturacion);
          }
          break;
        }

        // Fin de venta de billete a un pasajero.
        case Evento.FIN_VENTA_BILLETE: {
          finVentaBillete = -1;
          // Se genera el tiempo que tardará el pasajero atendido en pasar a la ventanilla de facturación.
          rndPaseEntreVentaYFacturacion = Math.random();
          tiempoPaseEntreVentaYFacturacion = this.getTiempoPasoEntreZonas(rndPaseEntreVentaYFacturacion);
          finPaseEntreVentaYFacturacion = (reloj + tiempoPaseEntreVentaYFacturacion);
          // Buscamos el pasajero atendido y le cambiamos el estado.
          let pasajeroAtendido: Pasajero = pasajerosEnSistema.find(pasajero => pasajero.getEstado() === EstadoPasajero.COMPRANDO_BILLETE);
          pasajeroAtendido.pasandoDeVentaAFacturacion();
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

        case Evento.FIN_BLOQUEO_CHEQUEO: {
          finBloqueoEmpleadoChequeo = -1;

          // Generamos la llegada del siguiente bloqueo.
          rndValorbeta = Math.random();
          tiempoEntreBloqueos = this.rungeKutta.getTiempoEntreAtentados(0, this.relojEnOchentaLlegadas, 0.01, rndValorbeta);
          this.rkAtentados.push(this.rungeKutta.getMatrizRK());
          proximoBloqueo = (reloj + tiempoEntreLlegadas);

          let pasajeroBloqueado: Pasajero = pasajerosEnSistema.find(pasajero => pasajero.getEstado() === EstadoPasajero.BLOQUEADO_EN_CHEQUEO);
          if (pasajeroBloqueado != null) {
            finChequeoBillete = (reloj + tiempoRemanenteChequeo);
            tiempoRemanenteChequeo = -1;
            pasajeroBloqueado.chequeandoBillete();
            empleadoChequeoBillete.ocupado();
          }
          else {
            empleadoChequeoBillete.libre();
          }
          break;
        }

        // Fin de simulación.
        case Evento.FIN_SIMULACION: {
          // Calculamos el tiempo de permanencia en el sistema de los pasajeros que quedaron en el sistema.
          for (let i: number = 0; i < pasajerosEnSistema.length; i++) {
            acuTiempoPasajeros += reloj - pasajerosEnSistema[i].getMinutoLlegada();
          }
          break;
        }
      }

      // Comparamos la cantidad de pasajeros en todas las colas en la iteración actual.
      cantMaxPasajerosEnAlgunaCola = Math.max(
        colaVentaBillete.length,
        colaFacturacion.length,
        colaChequeoBillete.length,
        colaControlMetales.length,
        cantMaxPasajerosEnAlgunaCola
      );

      cantMaxPasajerosEnColaControl = Math.max(colaControlMetales.length, cantMaxPasajerosEnColaControl);

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
    
        for (let i: number = 0; i < pasajerosEnSistema.length; i++) {
          evento.push(
            pasajerosEnSistema[i].getId().toString(),
            pasajerosEnSistema[i].getTipoPasajero(),
            EstadoPasajero[pasajerosEnSistema[i].getEstado()],
            pasajerosEnSistema[i].getMinutoLlegada().toFixed(4),
            pasajerosEnSistema[i].minutoLlegadaDeVentaAFacturacion.toFixed(4),
            pasajerosEnSistema[i].minutoLlegadaDeFacturacionAControl.toFixed(4),
            pasajerosEnSistema[i].minutoLlegadaDeChequeoBilleteAControl.toFixed(4),
            pasajerosEnSistema[i].minutoLlegadaDeControlAEmbarque.toFixed(4),
          );
        }

        this.matrizEstado.push(evento);

        // Actualizamos la cantidad de pasajeros máximos que hubo en el sistema.
        if (pasajerosEnSistema.length > this.cantMaxPasajeros)
          this.cantMaxPasajeros = pasajerosEnSistema.length;
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
        return Evento[Evento[i+1]];
      }
    }
    return -1;
  }
}