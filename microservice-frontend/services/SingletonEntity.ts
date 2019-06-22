import uuid from "uuid";

class SingletonEntity<T extends {[key: string]: any}> {
  
  public id: string;
  public content: T;
  
  protected static instance: SingletonEntity<any>;
  
  constructor() {
    this.id = uuid.v4();
    this.content = {} as T;
    return SingletonEntity.instance;
  }
  
}

export default SingletonEntity;
