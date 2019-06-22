import Promise from "bluebird";
import fs from "fs-extra";
import _ from "lodash";
import path from "path";

class Directory {
  
  public path: string;
  public options: Directory.Options;
  
  constructor(directory_or_file: string, options: Directory.Options = {}) {
    this.path = directory_or_file;
    this.options = options;
  }
  
  public list() {
    return Directory.get(path.resolve(this.path), this.options)
    .then(result => this.applyFilters(result))
    .reduce((result, value) => _.setWith(result, [value], value, Object), {})
    .then(result => this.applyOptions(result));
  }
  
  public require<T>(): Promise<Directory.Hierarchy<T>> {
    return Directory.get(path.resolve(this.path), this.options)
    .then(result => this.applyFilters(result))
    .reduce((result, value) => _.setWith(result, [value], require(value), Object), {})
    .then(list => this.applyOptions(list));
  }
  
  private applyFilters(list: string[]): string[] {
    if (this.options.extension) list = _.filter(list, path => !!path.match(new RegExp("(?<=\.)" + this.options.extension + "$")));
    if (this.options.filter) list = _.filter(list, path => this.options.filter(Directory.resolvePath(path, this.path), path));
    return list;
  }
  
  private applyOptions<T>(list: {[key: string]: T}): Directory.Hierarchy<T>;
  private applyOptions<T>(list: string[]): string[] | Directory.Hierarchy<T>;
  private applyOptions<T>(list: string[] | {[key: string]: T}): string[] | Directory.Hierarchy<T> {
    let result: string[] | {[key: string]: T};
    if (!this.options.full_path) result = _.isArray(list) ? _.map(list, path => Directory.resolvePath(path, this.path)) : _.mapKeys(list, (value, path) => Directory.resolvePath(path, this.path));
    if (this.options.hierarchy) result = Directory.hierarchyFromList(result || list, this.options.full_path && this.path);
    return result || list;
  }
  
  private static resolvePath(file_path: string, origin_path: string): string {
    return path.relative(origin_path, file_path).replace(/\\/g, "/");
  }
  
  private static hierarchyFromList<T>(list: string[] | {[key: string]: T}, origin?: string): string[] | {[key: string]: T} {
    if (_.isArray(list)) return _.reduce(list, (result, file_path) => _.setWith(result, (origin ? Directory.resolvePath(file_path, origin) : file_path).split("/"), file_path, Object), {});
    return _.reduce(list, (result, value, file_path) => _.setWith(result, (origin ? Directory.resolvePath(file_path, origin) : file_path).split("/"), value, Object), {});
  }
  
  private static get(fd: string, options: Directory.Options): Promise<string[]> {
    return Promise.resolve(fs.promises.access(fd))
    .then(() => Promise.resolve(fs.promises.stat(fd)))
    .then(stats => {
      if (stats.isFile()) return [fd];
      return Promise.resolve(fs.promises.readdir(fd))
      .reduce((result, sub_fd) => {
        if (options.recursive) return Directory.get(path.resolve(fd, sub_fd), options).then(files => _.concat(result, files));
        return Promise.resolve(fs.promises.stat(path.resolve(fd, sub_fd)))
        .then(stats => stats.isDirectory() ? {} : Directory.get(path.resolve(fd, sub_fd), options))
        .then(file => _.concat(result, file));
      }, []);
    });
  }
}

namespace Directory {
  export interface Options {
    recursive?: boolean
    full_path?: boolean
    hierarchy?: boolean
    extension?: string
    filter?: (path: string, full_path: string) => boolean
  }
  
  export type Hierarchy<T> = {[key: string]: Hierarchy<T> | T};
}

export default Directory;
