class Entity {
  
  constructor() {}
  
  protected static toBody(entity: Entity) {
    return Object.entries(entity).map(v => `${encodeURIComponent(v[0])}=${encodeURIComponent(v[1])}`).join("&");
  }
  
}

/* HHK @ StackOverflow (https://stackoverflow.com/questions/55479658/how-to-create-a-type-excluding-instance-methods-from-a-class-in-typescript) */

type FlagExcludedType<Base, Type> = { [Key in keyof Base]: Base[Key] extends Type ? never : Key };
type AllowedNames<Base, Type> = FlagExcludedType<Base, Type>[keyof Base];
type OmitType<Base, Type> = Pick<Base, AllowedNames<Base, Type>>;
export type EntityObject<T> = OmitType<T, Function>;

export type JSONResponse<T extends {[key: string]: any}> = {
  code: number
  content: T
  time_complete: string
  time_started: string
  time_elapsed: string
}

export default Entity;
