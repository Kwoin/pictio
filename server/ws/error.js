export class PictioError extends Error {

  #error;

  constructor(error, message){
    super(message ?? error.message);
    this.#error = error;
    this.name = "PictioError"
  }

  get code() {
    return this.#error.code;
  }

}

export const ERROR = {
  NOT_FOUND: {
    code: "404",
    message: "Element not found"
  },
  UNAUTHORIZED: {
    code: "403",
    message: "Not allowed"
  },
  ILLEGAL_STATE: {
    code: "400",
    message: "Illegal state"
  },
}
