type MapObject = {
    spriteName:string;
    strength: number;
};

const Capital = {
    spriteName: "capital",
    strength: 1,
} as const;

const Castle = {
    spriteName: "castle",
    strength: 2,
    cost: 15,
} as const;

const Gravestone = {
    spriteName: "gravestone",
    strength: 0,
} as const;

const Tree = {
    spriteName: "tree",
    strength: 0,
} as const;

const PalmTree = {
    spriteName: "palm_tree",
    strength: 0,
} as const;

const Peasant = {
    spriteName: "peasant",
    strength: 1,
    salary: 2,
    cost: 10,
} as const;

const Spearman = {
    spriteName: "spearman",
    strength: 2,
    salary: 6,
    cost: 10,
} as const;

const Knight = {
    spriteName: "knight",
    strength: 3,
    salary: 18,
    cost: 10,
} as const;

const Baron = {
    spriteName: "baron",
    strength: 4,
    salary: 54,
    cost: 10,
} as const;

const Units = [Peasant, Spearman, Knight, Baron] as const;

type UnitType = typeof Units[number];

type Unit = {
    canAct: boolean;
    unitType: UnitType;
}
