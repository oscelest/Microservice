import uuid from "uuid";

class Entity<T extends {[key: string]: any}> {
  
  public id: string;
  public content: T;
  
  protected constructor() {
    this.id = uuid.v4();
    this.content = {} as T;
  }
  
}

export default Entity;
