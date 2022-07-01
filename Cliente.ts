import { EstadoCliente } from "./EstadoCliente";

export class Cliente {
  private id: number;
  private tipoCliente: string;
  private segundoLlegada: number;
  private estado: EstadoCliente;
  private _segSalidaSist: number;

  public get segundoSalidaSistema() {
    return this._segSalidaSist;
  }

  public constructor(id: number, tipoCliente: string, segundoLlegada: number) {
    this.id = id;
    this.tipoCliente = tipoCliente;
    this.segundoLlegada = segundoLlegada;
    this._segSalidaSist = -1;
  }

  public comprandoComida(): void{
    this.estado = EstadoCliente.COMPRANDO_COMIDA;
  }

  public enEsperaCompra(): void {
    this.estado = EstadoCliente.ESPERANDO_COMPRA;
  }

  public siendoAtendidoEmp1(): void {
    this.estado = EstadoCliente.SIENDO_ATENDIDO_EMP1;
  }

  public siendoAtendidoEmp2(): void {
    this.estado = EstadoCliente.SIENDO_ATENDIDO_EMP2;
  }

  public enEsperaPreparacion(): void {
    this.estado = EstadoCliente.ESPERANDO_PREPARACION;
  }

  public consumiendoComida(): void {
    this.estado = EstadoCliente.CONSUMIENDO_COMIDA;
  }

  public utilizandoMesa(): void {
    this.estado = EstadoCliente.UTILIZANDO_MESA;
  }

  public getEstado(): EstadoCliente {
    return this.estado;
  }

  public getId(): number {
    return this.id;
  }

  public getTipoCliente(): string {
    return this.tipoCliente;
  }

  public getSegundoLlegada(): number {
    return this.segundoLlegada;
  }
}