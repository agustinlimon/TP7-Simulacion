export class RungeKutta {
  private matrizRK: number[][];

  public ecuacionCafe(p: number): number {
    return  -35 - 0.7 * p;
  }

  public ecuacionCafeYMedialuna(p: number): number {
    return  -60 - 0.7 * p;
  }

  public ecuacionMenu(p: number): number {
    return  -115 - 0.7 * p;
  }

  public getMatrizRK(): number[][] {
    return this.matrizRK;
  }

  // Obtenemos el tiempo de preparacion de un Cafe
  public getTiempoPreparacionCafe(t0: number, p: number, h: number): number {
    this.matrizRK = [];
    let fila: number[];
    let p0: number = p;

    while (true) {
      if (p0 <= 0) break;
      fila = [];
      fila.push(t0, p0);

      let k1: number = this.ecuacionCafe(p0);
      let k2: number = this.ecuacionCafe(p0 + (k1*h/2));
      let k3: number = this.ecuacionCafe(p0 + (k2*h/2));
      let k4: number = this.ecuacionCafe(p0 + (k3*h));

      t0 = t0 + h;
      p0 = p0 + ((h/6) * (k1 + 2 * k2 + 2 * k3 + k4));

      fila.push(k1, k2, k3, k4, t0, p0);
      this.matrizRK.push(fila);
    }
    return this.matrizRK[this.matrizRK.length-1][6] * 6;
  }

  // Obtenemos el tiempo de preparacion de un Cafe con Medialunas
  public getTiempoPreparacionCafeYMedialuna(t0: number, p: number, h: number): number {
    this.matrizRK = [];
    let fila: number[];
    let p0: number = p;

    while (true) {
      if (p0 <= 0) break;
      fila = [];
      fila.push(t0, p0);

      let k1: number = this.ecuacionCafeYMedialuna(p0);
      let k2: number = this.ecuacionCafeYMedialuna(p0 + (k1*h/2));
      let k3: number = this.ecuacionCafeYMedialuna(p0 + (k2*h/2));
      let k4: number = this.ecuacionCafeYMedialuna(p0 + (k3*h));

      t0 = t0 + h;
      p0 = p0 + ((h/6) * (k1 + 2 * k2 + 2 * k3 + k4));

      fila.push(k1, k2, k3, k4, t0, p0);
      this.matrizRK.push(fila);
    }
    return this.matrizRK[this.matrizRK.length-1][6] * 6;
  }

  // Obtenemos el tiempo de preparacion de un Menu
  public getTiempoPreparacionMenu(t0: number, p: number, h: number): number {
    this.matrizRK = [];
    let fila: number[];
    let p0: number = p;

    while (true) {
      if (p0 <= 0) break;
      fila = [];
      fila.push(t0, p0);

      let k1: number = this.ecuacionMenu(p0);
      let k2: number = this.ecuacionMenu(p0 + (k1*h/2));
      let k3: number = this.ecuacionMenu(p0 + (k2*h/2));
      let k4: number = this.ecuacionMenu(p0 + (k3*h));

      t0 = t0 + h;
      p0 = p0 + ((h/6) * (k1 + 2 * k2 + 2 * k3 + k4));

      fila.push(k1, k2, k3, k4, t0, p0);
      this.matrizRK.push(fila);
    }
    return this.matrizRK[this.matrizRK.length-1][6] * 6;
  }
}