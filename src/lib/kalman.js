// src/lib/kalman.js

// Un filtro de Kalman 1D genérico
export class KalmanFilter {
    /**
     * @param {object} options
     * @param {number} options.R – covarianza de proceso (ruido interno)
     * @param {number} options.Q – covarianza de medición (ruido del GPS)
     * @param {number} [options.A=1] – transición de estado
     * @param {number} [options.B=0] – control-input model (no usado aquí)
     * @param {number} [options.C=1] – observación del estado
     */
    constructor({ R, Q, A = 1, B = 0, C = 1 }) {
      this.R = R;
      this.Q = Q;
      this.A = A;
      this.B = B;
      this.C = C;
      this.x = NaN;    // estado estimado
      this.cov = NaN;  // covarianza estimada
    }
    filter(z, u = 0) {
      if (isNaN(this.x)) {
        // Inicializar con la primera medición
        this.x = (1 / this.C) * z;
        this.cov = (1 / this.C) * this.Q * (1 / this.C);
      } else {
        // 1) Predicción
        const predX   = this.A * this.x + this.B * u;
        const predCov = this.A * this.cov * this.A + this.R;
  
        // 2) Ganancia de Kalman
        const K = predCov * this.C / (this.C * predCov * this.C + this.Q);
  
        // 3) Corrección
        this.x   = predX + K * (z - this.C * predX);
        this.cov = predCov - K * this.C * predCov;
      }
      return this.x;
    }
  }
  