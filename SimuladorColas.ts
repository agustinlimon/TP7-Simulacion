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
    tiempoVenta: number,
    AFinConsumicionPedido: number, 
    BFinConsumicionPedido: number, 
    AFinUtilizacionMesa: number, 
    BFinUtilizacionMesa: number): void {
    
    // Creamos un vector con las probabilidades de los eventos.
    this.probTiposClientes = [0.3, 0.5, 1];
    this.probOcupaMesa = [0.5, 1];
    this.probTiposPedidos = [0.33, 0.66, 1];

    this.mediaTiempoEntreLlegadas = mediaLlegadaClientes;
    this.desviacionTiempoEntreLlegada = DesviacionLlegadaClientes;
    this.mediaTiempoEntregaPedido = mediaFinEntregaPedido;
    this.tiempoVentaTicket = tiempoVenta;
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

    // Llegada de un cliente.
    let rnd1Llegada: number = -1;
    let rnd2Llegada: number = -1;
    let tiempoEntreLlegadas: number = -1;
    let proximaLlegada: number = -1;
    let rndTipoCliente: number = -1;
    let tipoCliente: string = '';

    // Compra Ticket.
    let tiempoCaja: number = -1;
    let finCaja: number = -1;

    // Preparacion Comida.
    let rndTiempoEntrega: number = -1;
    let tiempoEntrega: number = -1;
    let rndTipoPedido: number = -1;
    let tipoPedido: string = '';
    let tiempoPreparacion: number = -1;
    let finPreparacion1: number = -1;
    let finPreparacion2: number = -1;
    let rndOcupaMesa: number = -1;
    let ocupaMesa: string = '';

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

    // Clientes en el sistema.
    let clientesEnSistema: Cliente[] = [];

    // Métricas.
    let totalClientesA: number = 0;
    let totalClientesB: number = 0;
    let totalClientesC: number = 0;
    let totalClientes: number = 0;
    let acuTiempoClientes: number = 0;
    let segTiempoOciosoEmp1PrepDesde: number = 0;
    let acuTiempoOciosoEmp1Prep: number = 0;
    let cantMaxCliEnColaCaja: number = 0;

    // Extras.
    this.cantMaxClientes = 0;  
    let cafeFlag: boolean = false;
    let cafeMedFlag: boolean = false;
    let menuFlag: boolean = false;
    
    
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

          // Creamos el objeto cliente para usarlo dependiendo de su tipo.
          let cliente: Cliente = new Cliente(
            totalClientes,
            tipoCliente,
            reloj
          );

          switch (tipoCliente) {
            // Llega un cliente de tipo A. Va a comprar algo.
            case "A": {
              clientesEnSistema.push(cliente);
              totalClientesA++;
              if (empleadoCaja.estaLibre()) {
                cliente.comprandoComida();
                empleadoCaja.ocupado();
  
                // El tiempo de atencion es constante.
                tiempoCaja = tiempoVenta;
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
              clientesEnSistema.push(cliente);
              totalClientesB++;  

              // Generamos el tiempo de Utilizacion de la mesa.
              rndUtilizacionMesa = Math.random();
              tiempoUtilizacionMesa = this.getTiempoUtilizacionMesa(rndUtilizacionMesa);
              finUtilizacionMesa = (reloj + tiempoUtilizacionMesa);
              cliente.segundoSalidaSistema = finUtilizacionMesa;
              cliente.utilizandoMesa();
              break;
            }
  
            // Llega un cliente de tipo C. Esta de pasada por el sistema.
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

            tiempoCaja = tiempoVenta;
            finCaja = (reloj + tiempoCaja);
          }
          
          // Buscamos al cliente que termino de ser atendido en la caja. 
          let clienteAtendido: Cliente = clientesEnSistema.find(cli => cli.getEstado() === EstadoCliente.COMPRANDO_COMIDA);

          // Si hay algun empleado libre calculamos el tiempo de Preparacion.
          if (empleadoPreparacion1.estaLibre()){
            clienteAtendido.siendoAtendidoEmp1();
            empleadoPreparacion1.ocupado();
            acuTiempoOciosoEmp1Prep += reloj - segTiempoOciosoEmp1PrepDesde;

            // Calculamos el tiempo entrega
            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);

            // Determinamos el tipo de pedido
            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);

            switch (tipoPedido) {
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                if (!cafeFlag)
                  this.rkCafe.push(this.rungeKutta.getMatrizRK());
                cafeFlag = true;
                break;
              }
      
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                if (!cafeMedFlag)
                  this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                cafeMedFlag = true;
                break;
              }
      
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                if (!menuFlag)
                  this.rkMenu.push(this.rungeKutta.getMatrizRK());
                menuFlag = true;
                break;
              }
            }
            finPreparacion1 = reloj + tiempoEntrega + tiempoPreparacion;
          }
          else if (empleadoPreparacion2.estaLibre()){
            clienteAtendido.siendoAtendidoEmp2();
            empleadoPreparacion2.ocupado();

            // Calculamos el tiempo entrega
            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);

            // Determinamos el tipo de pedido
            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);

            switch (tipoPedido) {
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                if (!cafeFlag)
                  this.rkCafe.push(this.rungeKutta.getMatrizRK());
                cafeFlag = true;
                break;
              }
      
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                if (!cafeMedFlag)
                  this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                cafeMedFlag = true;
                break;
              }
      
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                if (!menuFlag)
                  this.rkMenu.push(this.rungeKutta.getMatrizRK());
                menuFlag = true;
                break;
              }
            }
            finPreparacion2 = reloj + tiempoEntrega + tiempoPreparacion;
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
          // Buscamos el cliente que esta siendo atendido.
          let indiceCliente: number = clientesEnSistema.findIndex(cli => cli.getEstado() === EstadoCliente.SIENDO_ATENDIDO_EMP1);
          let clienteAtendido: Cliente = clientesEnSistema[indiceCliente];

          // Calculamos si va a usar una mesa y por cuanto tiempo.
          rndOcupaMesa = Math.random();
          ocupaMesa = this.getOcupacionMesa(rndOcupaMesa, ["SI", "NO"]);
          if (ocupaMesa === "SI"){
            rndConsumicion = Math.random();
            tiempoConsumicion = this.getTiempoConsumicionPedido(rndConsumicion);
            finConsumicion = reloj + tiempoConsumicion;
            clienteAtendido.segundoSalidaSistema = finConsumicion;
            clienteAtendido.consumiendoComida();
          }
          else {
            let tiempoPermanencia: number = reloj - clienteAtendido.getSegundoLlegada();
            acuTiempoClientes += tiempoPermanencia;
            clientesEnSistema.splice(indiceCliente, 1);
          }

          // Preguntamos si hay alguien en la cola.
          if (colaPreparacion.length === 0) {
            empleadoPreparacion1.libre();
            segTiempoOciosoEmp1PrepDesde = reloj;
          }
          else {
            empleadoPreparacion1.ocupado();
            // Quitamos a un cliente de la cola y cambiamos su estado.
            colaPreparacion.shift().siendoAtendidoEmp1();

            // Calculamos el tiempo de Preparacion.
            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);

            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);

            switch (tipoPedido) {
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                if (!cafeFlag)
                  this.rkCafe.push(this.rungeKutta.getMatrizRK());
                cafeFlag = true;
                break;
              }
      
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                if (!cafeMedFlag)
                  this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                cafeMedFlag = true;
                break;
              }
      
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                if (!menuFlag)
                  this.rkMenu.push(this.rungeKutta.getMatrizRK());
                menuFlag = true;
                break;
              }
            }
            finPreparacion1 = reloj + tiempoEntrega + tiempoPreparacion;
          }
          break;
        }

        // Fin de Preparacion del Empleado 2.
        case Evento.FIN_ENTREGA_2: {
          finPreparacion2 = -1;
          // Buscamos el cliente que esta siendo atendido.
          let indiceCliente: number = clientesEnSistema.findIndex(cli => cli.getEstado() === EstadoCliente.SIENDO_ATENDIDO_EMP2);
          let clienteAtendido: Cliente = clientesEnSistema[indiceCliente];

          // Calculamos si va a usar una mesa y por cuanto tiempo.
          rndOcupaMesa = Math.random();
          ocupaMesa = this.getOcupacionMesa(rndOcupaMesa, ["SI", "NO"]);
          if (ocupaMesa === "SI"){
            rndConsumicion = Math.random();
            tiempoConsumicion = this.getTiempoConsumicionPedido(rndConsumicion);
            finConsumicion = reloj + tiempoConsumicion;
            clienteAtendido.segundoSalidaSistema = finConsumicion;
            clienteAtendido.consumiendoComida();
          }
          else {
            let tiempoPermanencia: number = reloj - clienteAtendido.getSegundoLlegada();
            acuTiempoClientes += tiempoPermanencia;
            clientesEnSistema.splice(indiceCliente, 1);
          }

          // Preguntamos si hay alguien en la cola.
          if (colaPreparacion.length === 0) {
            empleadoPreparacion2.libre();
          }
          else{
            empleadoPreparacion2.ocupado();
            // Quitamos a un cliente de la cola y cambiamos su estado.
            colaPreparacion.shift().siendoAtendidoEmp2();

            // Calculamos el tiempo de Preparacion.
            rndTiempoEntrega = Math.random();
            tiempoEntrega = this.getTiempoEntregaPedido(rndTiempoEntrega);
          
            rndTipoPedido = Math.random();
            tipoPedido = this.getTipoPedido(rndTipoPedido, ["Cafe", "CafeYMedialuna", "Menu"]);
          
            switch (tipoPedido) {
              case "Cafe": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafe(0, 95, 0.01);
                if (!cafeFlag)
                  this.rkCafe.push(this.rungeKutta.getMatrizRK());
                cafeFlag = true;
                break;
              }
            
              case "CafeYMedialuna": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionCafeYMedialuna(0, 95, 0.01);
                if (!cafeMedFlag)
                  this.rkCafeYMedialuna.push(this.rungeKutta.getMatrizRK());
                cafeMedFlag = true;
                break;
              }
            
              case "Menu": {
                tiempoPreparacion = this.rungeKutta.getTiempoPreparacionMenu(0, 95, 0.01);
                if (!menuFlag)
                  this.rkMenu.push(this.rungeKutta.getMatrizRK());
                menuFlag = true;
                break;
              }
            }
            finPreparacion2 = reloj + tiempoEntrega + tiempoPreparacion;
          }
          break;
        }

        // Salida de un cliente del sistema ya sea porque termino de consumir su pedido o porque termino de ocupar la mesa.
        case Evento.SALIDA_CLIENTE: {
          if (finConsumicion === reloj)
            finConsumicion = -1;
          if (finUtilizacionMesa === reloj)
            finUtilizacionMesa = -1;

          // Buscamos el cliente y lo eliminamos del sistema.
          let indiceCliente: number = clientesEnSistema.findIndex(cli => (cli.getEstado() === EstadoCliente.CONSUMIENDO_COMIDA || EstadoCliente.UTILIZANDO_MESA) && cli.segundoSalidaSistema === reloj);
          let clienteAtendido: Cliente = clientesEnSistema[indiceCliente];

          // Calculamos el tiempo de permanencia en el sistema.
          let tiempoPermanencia: number = reloj - clienteAtendido.getSegundoLlegada();
          acuTiempoClientes += tiempoPermanencia;
          clientesEnSistema.splice(indiceCliente, 1);
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

      // Calculo de la ultima metrica.
      cantMaxCliEnColaCaja = Math.max(colaCaja.length, cantMaxCliEnColaCaja);

      // Cargamos la matriz de estado a mostrar solo para el rango pasado por parámetro.
      if ((i >= eventoDesde && i <= indiceHasta) || i == cantEventos-1) {
        evento.push(
          i.toString(),
          Evento[tipoEvento],
          reloj.toFixed(4),

          rnd1Llegada.toFixed(4),
          rnd2Llegada.toFixed(4),
          tiempoEntreLlegadas.toFixed(4),
          proximaLlegada.toFixed(4),
          rndTipoCliente.toFixed(4),
          tipoCliente,
    
          tiempoCaja.toFixed(4),
          finCaja.toFixed(4),

          rndTiempoEntrega.toFixed(4),
          tiempoEntrega.toFixed(4),
          rndTipoPedido.toFixed(4),
          tipoPedido,
          tiempoPreparacion.toFixed(4),
          finPreparacion1.toFixed(4),
          finPreparacion2.toFixed(4),
          rndOcupaMesa.toFixed(4),
          ocupaMesa,

          rndConsumicion.toFixed(4),
          tiempoConsumicion.toFixed(4),
          finConsumicion.toFixed(4),

          rndUtilizacionMesa.toFixed(4),
          tiempoUtilizacionMesa.toFixed(4),
          finUtilizacionMesa.toFixed(4),
    
          empleadoCaja.getEstado(),
          colaCaja.length.toString(),
    
          empleadoPreparacion1.getEstado(),
          empleadoPreparacion2.getEstado(),
          colaPreparacion.length.toString(),
    
          totalClientesA.toString(),
          totalClientesB.toString(),
          totalClientesC.toString(),
          acuTiempoClientes.toFixed(4),
          acuTiempoOciosoEmp1Prep.toFixed(4),
          cantMaxCliEnColaCaja.toString(),
        );
    
        for (let i: number = 0; i < clientesEnSistema.length; i++) {
          evento.push(
            clientesEnSistema[i].getId().toString(),
            clientesEnSistema[i].getTipoCliente(),
            EstadoCliente[clientesEnSistema[i].getEstado()],
            clientesEnSistema[i].getSegundoLlegada().toFixed(4),
            clientesEnSistema[i].segundoSalidaSistema.toFixed(4),
          );
        }

        this.matrizEstado.push(evento);

        // Actualizamos la cantidad de pasajeros máximos que hubo en el sistema.
        if (clientesEnSistema.length > this.cantMaxClientes)
          this.cantMaxClientes = clientesEnSistema.length;
      }

      // Reseteamos algunas variables.
      rnd1Llegada = -1;
      rnd2Llegada = -1;
      tiempoEntreLlegadas = -1;
      rndTipoCliente = -1;
      tipoCliente = "";
      tiempoCaja = -1;
      rndTiempoEntrega = -1;
      tiempoEntrega = -1;
      rndTipoPedido = -1;
      tipoPedido = "";
      tiempoPreparacion = -1;
      rndOcupaMesa = -1;
      ocupaMesa = "";
      rndConsumicion = -1;
      tiempoConsumicion = -1;
      rndUtilizacionMesa = -1;
      tiempoUtilizacionMesa = -1;
    }
  }

  // Metodo para determinar el siguiente evento de la simulación.
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