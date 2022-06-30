import { EstadoCliente } from "./EstadoCliente";

export class Cliente {
  private id: number;
  private tipoCliente: string;
  private minutoLlegada: number;
  private estado: EstadoCliente;

  public constructor(id: number, tipoCliente: string, minutoLlegada: number) {
    this.id = id;
    this.tipoCliente = tipoCliente;
    this.minutoLlegada = minutoLlegada;
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

  public getMinutoLlegada(): number {
    return this.minutoLlegada;
  }
}