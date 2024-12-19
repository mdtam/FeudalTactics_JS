export type MapObject = {
    spriteName: string;
    strength: number;
};

export const Capital = {
    spriteName: "capital",
    strength: 1,
} as const;

export const Castle = {
    spriteName: "castle",
    strength: 2,
    cost: 15,
} as const;

export const Gravestone = {
    spriteName: "gravestone",
    strength: 0,
} as const;

export const Tree = {
    spriteName: "tree",
    strength: 0,
} as const;

export const PalmTree = {
    spriteName: "palm_tree",
    strength: 0,
} as const;

export const Peasant = {
    spriteName: "peasant",
    strength: 1,
    salary: 2,
    cost: 10,
} as const;

export const Spearman = {
    spriteName: "spearman",
    strength: 2,
    salary: 6,
    cost: 10,
} as const;

export const Knight = {
    spriteName: "knight",
    strength: 3,
    salary: 18,
    cost: 10,
} as const;

export const Baron = {
    spriteName: "baron",
    strength: 4,
    salary: 54,
    cost: 10,
} as const;

export const Units = [Peasant, Spearman, Knight, Baron] as const;

export type UnitType = (typeof Units)[number];

export type Unit = {
    canAct: boolean;
    unitType: UnitType;
};

