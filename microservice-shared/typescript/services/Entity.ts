import _ from "lodash";

class Entity {
  
  public toJSON(): Partial<{ [K in keyof this]: this[K] }> {
    return _.mapValues(this, (v: any, k) => {
      if (v instanceof Buffer) {
        if ((v = v.toString("hex")).length === 32) return v.replace(/(?<=^(?:.{8}|.{12}|.{16}|.{20}))/g, "-");
      }
      return v;
    });
  }
  
  public static isUUID(id: string | Buffer) {
    return Buffer.isBuffer(id) ? _.every([9, 13, 18, 23], k => id[k] === 45) : !!(id || "").toString().match(/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i);
  }
  
  public static bufferFromUUID(id: string | Buffer) {
    return id instanceof Buffer ? id : (Entity.isUUID(id) ? Buffer.from((id || "").replace(/-/g, ""), "hex") : Buffer.from((id || ""), "ascii"));
  }
  
  public static uuidFromBuffer(buffer: string | Buffer) {
    return typeof buffer === "string" ? buffer : (_.join(_.tail(buffer.toString("hex").match(/([a-f0-9]{8})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{4})([a-f0-9]{12})/)), "-"));
  }
  
  public static hexFromUUID(uuid: string) {
    return `0x${uuid.replace(/-/g, "")}`;
  }
  
  public static hexFromBuffer(buffer: Buffer) {
    return `0x${buffer.toString('hex')}`;
  }
  
}

namespace Entity {
  
  export type OneToMany<T> = T | T[];
  
}

export default Entity;
