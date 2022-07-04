import { RungeKutta } from "./RungeKutta";

export abstract class Simulador { 
  protected mediaTiempoEntreLlegadas: number;
  protected desviacionTiempoEntreLlegada: number;

  protected mediaTiempoEntregaPedido: number;

  protected tiempoVentaTicket: number;

  protected aTiempoConsumicionPedido: number;
  protected bTiempoConsumicionPedido: number;

  protected aTiempoUtilizacionMesa: number;
  protected bTiempoUtilizacionMesa: number;

  protected matrizEstado: string[][];

  protected cantMaxClientes: number;

  protected probTiposClientes: number[];
  protected probOcupaMesa: number[];
  protected probTiposPedidos: number[];

  protected rungeKutta: RungeKutta = new RungeKutta();
  protected rkCafe: Array<number[][]> = [];
  protected rkCafeYMedialuna: Array<number[][]> = [];
  protected rkMenu: Array<number[][]> = [];

  public abstract simular(
    cantEventos: number,
    eventoDesde: number,
    mediaLlegadaClientes: number, 
    DesviacionLlegadaClientes: number, 
    mediaFinEntregaPedido: number, 
    tiempoVenta: number,
    AFinConsumicionPedido: number, 
    BFinConsumicionPedido: number, 
    AFinUtilizacionMesa: number, 
    BFinUtilizacionMesa: number): void;

  public getMatrizEstado(): string[][] {
    return this.matrizEstado;
  }

  public getRKCafe(): Array<number[][]> {
    return this.rkCafe;
  }

  public getRKCafeYMedialuna(): Array<number[][]> {
    return this.rkCafeYMedialuna;
  }

  public getRKMenu(): Array<number[][]> {
    return this.rkMenu;
  }

  public getCantMaxClientesEnSistema(): number {
    return this.cantMaxClientes;
  }

  public getDistribucionExponencial(rnd: number, media: number): number {
    if (1 - rnd !== 0) return -media * Math.log(1 - rnd);
    return -media * Math.log(1 - rnd + 9e-16);
  }

  // Cálculo del tiempo entre llegadas de clientes, que tiene distribución normal.
  public getTiempoEntreLlegadas(rndTiempoChequeo1: number, rndTiempoChequeo2: number): number {
    if (rndTiempoChequeo1 === 0) rndTiempoChequeo1 += 1e-16;
    if (rndTiempoChequeo2 === 0) rndTiempoChequeo2 += 1e-16;
    let tiempo: number = (Math.sqrt(-2 * Math.log(rndTiempoChequeo1)) * Math.cos(2 * Math.PI * rndTiempoChequeo2)) * this.desviacionTiempoEntreLlegada + this.mediaTiempoEntreLlegadas;
    return Math.abs(tiempo);
  }

  // Obtención del tipo de Cliente según la probabilidad asociada.
  public getTipoCliente(probTipoCli: number, tiposCli: string[]): string {
    for (let i: number = 0; i < this.probTiposClientes.length; i++) {
      if (probTipoCli < this.probTiposClientes[i])
        return tiposCli[i];
    }
  }

  // Obtención del tipo de Pedido según la probabilidad asociada.
  public getTipoPedido(probTipoPedi: number, tiposPedi: string[]): string {
    for (let i: number = 0; i < this.probTiposPedidos.length; i++) {
      if (probTipoPedi < this.probTiposPedidos[i])
        return tiposPedi[i];
    }
  }

  // Ocupa o no mesa para consumir en la cafeteria según la probabilidad asociada.
  public getOcupacionMesa(probOcupa: number, opciones: string[]): string {
    for (let i: number = 0; i < this.probOcupaMesa.length; i++) {
      if (probOcupa < this.probOcupaMesa[i])
        return opciones[i];
    }
  }
  
  // Cálculo del tiempo de Consumicion pedido, que tiene distribución uniforme.
  public getTiempoConsumicionPedido(rndTiempoConsumicion: number): number {
    let tiempo: number = this.aTiempoConsumicionPedido + rndTiempoConsumicion * (this.bTiempoConsumicionPedido - this.aTiempoConsumicionPedido);
    return tiempo;
  }

  // Cálculo del tiempo de Utilizacion Mesa, que tiene distribución uniforme.
  public getTiempoUtilizacionMesa(rndTiempoUtilizacion: number): number {
    let tiempo: number = this.aTiempoUtilizacionMesa + rndTiempoUtilizacion * (this.bTiempoUtilizacionMesa - this.aTiempoUtilizacionMesa);
    return tiempo;
  }

  // Cálculo del tiempo de entrega pedido, que tiene distribución exponencial.
  public getTiempoEntregaPedido(rndTiempoEntrega: number): number {
    let tiempo: number = this.getDistribucionExponencial(rndTiempoEntrega, this.mediaTiempoEntregaPedido);
    return tiempo;
  }
}