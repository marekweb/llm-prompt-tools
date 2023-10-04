import { StructuredDataDefinition } from "../common/StructuredDataDefinition";

const defs: StructuredDataDefinition[] = [
  {
    id: "product",
    name: "Product extractor",
    fields: [
      {
        key: "price",
        description: "Price of the product",
        kind: "price",
        unit: "USD",
      },
      {
        key: "name",
        description: "Name or title of the product",
        kind: "name",
      },
      {
        key: "mac_compatible",
        description: "Compatible with Mac",
        kind: "boolean",
      },
      {
        key: "capacity",
        description: "Storage capacity",
        kind: "amount",
        unit: "MB",
      },
      {
        key: "manufacturer",
        description: "Manufacturer of the product",
        kind: "name",
      },
    ],
  },
  {
    id: "person-bio",
    name: "Personal Bio",
    fields: [
      {
        key: "name",
        description: "Full name of the person",
        kind: "name",
      },
      {
        key: "birthdate",
        description: "Birthdate of the person",
        kind: "date",
      },
      {
        key: "role",
        description: "Role or job of the person",
        kind: "name",
      },
      {
        key: "net_worth",
        description: "Estimated net worth of the person",
        kind: "amount",
        unit: "Million USD",
      },
    ],
  },
];

export class DefsDatabase {
  async create(def: StructuredDataDefinition) {
    defs.push(def);
    return def;
  }

  async delete(id: string) {
    const index = defs.findIndex((d) => d.id === id);
    if (index === -1) {
      return false;
    }
    defs.splice(index, 1);
    return true;
  }

  async get(id: string) {
    return defs.find((d) => d.id === id);
  }

  async update(id: string, def: StructuredDataDefinition) {
    const index = defs.findIndex((d) => d.id === id);
    if (index === -1) {
      return null;
    }
    defs[index] = def;
    return def;
  }

  async getAll() {
    return defs;
  }
}

export async function connect() {
  return new DefsDatabase();
}
