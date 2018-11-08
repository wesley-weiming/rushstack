// Copyright (c) Microsoft Corporation. All rights reserved. Licensed under the MIT license.
// See LICENSE in the project root for license information.

import { Constructor, PropertiesOf } from '../mixins/Mixin';

/** @public */
export const enum ApiItemKind {
  Class = 'Class',
  EntryPoint = 'EntryPoint',
  Interface = 'Interface',
  Method = 'Method',
  MethodSignature = 'MethodSignature',
  Model = 'Model',
  Namespace = 'Namespace',
  Package = 'Package',
  Parameter = 'Parameter',
  Property = 'Property',
  PropertySignature = 'PropertySignature',
  None = 'None'
}

/** @public */
export interface IApiItemOptions {
  name: string;
}

export interface IApiItemJson {
  name: string;
  kind: ApiItemKind;
  canonicalReference: string;
}

/**
 * PRIVATE
 * Allows ApiItemContainerMixin to assign the parent.
 */
// tslint:disable-next-line:variable-name
export const ApiItem_parent: unique symbol = Symbol('ApiItem._parent');

/** @public */
export class ApiItem {
  public [ApiItem_parent]: ApiItem | undefined;

  private readonly _name: string;

  public static deserialize(jsonObject: IApiItemJson): ApiItem {
    // tslint:disable-next-line:no-use-before-declare
    return Deserializer.deserialize(jsonObject);
  }

  /** @virtual */
  public static onDeserializeInto(options: Partial<IApiItemOptions>, jsonObject: IApiItemJson): void {
    options.name = jsonObject.name;
  }

  public constructor(options: IApiItemOptions) {
    this._name = options.name;
  }

  /** @virtual */
  public serializeInto(jsonObject: Partial<IApiItemJson>): void {
    jsonObject.kind = this.kind;
    jsonObject.name = this.name;
    jsonObject.canonicalReference = this.canonicalReference;
  }

  /** @virtual */
  public get kind(): ApiItemKind {
    throw new Error('ApiItem.kind was not implemented by the child class');
  }

  public get name(): string {
    return this._name;
  }

  /** @virtual */
  public get canonicalReference(): string {
    throw new Error('ApiItem.canonicalReference was not implemented by the child class');
  }

  /**
   * If this item was added to a ApiItemContainerMixin item, then this returns the container item.
   * If this is an ApiParameter that was added to a method or function, then this returns the function item.
   * Otherwise, it returns undefined.
   * @virtual
   */
  public get parent(): ApiItem | undefined {
    return this[ApiItem_parent];
  }

  /**
   * This property supports a visitor pattern for walking the tree.
   * For items with ApiItemContainerMixin, it returns the contained items.
   * Otherwise it returns an empty array.
   * @virtual
   */
  public get members(): ReadonlyArray<ApiItem> {
    return [];
  }

  /**
   * Returns the chain of ancestors, starting from the root of the tree, and ending with the this item.
   */
  public getHierarchy(): ReadonlyArray<ApiItem> {
    const hierarchy: ApiItem[] = [];
    for (let current: ApiItem | undefined = this; current !== undefined; current = current.parent) {
      hierarchy.push(current);
    }
    hierarchy.reverse();
    return hierarchy;
  }

  /** @virtual */
  public getSortKey(): string {
    return this.canonicalReference;
  }
}

// For mixins
export interface IApiItemConstructor extends Constructor<ApiItem>, PropertiesOf<typeof ApiItem> { }

// Circular import
import { Deserializer } from './Deserializer';
