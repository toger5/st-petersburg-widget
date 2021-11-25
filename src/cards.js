export const CardType = {
    Lumberack: 0,
    Goldminer: 1,
    Sheperd: 2,
    FurTrapper: 3,
    ShipBuilder: 4,
    CzarAndCarpenter: 5,

    Market: 6,
    CustomsHouse: 7,
    Firehouse: 8,
    Hospital: 9,
    Library: 10,
    Theater: 11,
    Academy: 12,
    PotemkinViallage: 13,
    Pub: 14,
    WareHouse: 15,
    Observatory: 16,

    Author: 17,
    Administrator: 18,
    WarehouseManager: 19,
    Secratary: 20,
    Controller: 21,
    Judge: 22,
    MistressOfCeremonies: 23,

    CarpenterWorkshop: 24,
    GoldSmelter: 25,
    WeavingMill: 26,
    FurShop: 27,
    Wharf: 28,
    Bank: 29,
    Peterhof: 30,
    StIsaacsCathedral: 31,
    MarinksyTheater: 32,
    ChurchOfTheResurrection: 33,
    Harbor: 34,
    CathedralOfTheGreatPalace: 35,
    SmolnyCathedral: 36,
    Hermitage: 37,
    WinterPalace: 38,
    Abbot: 39,
    WeaponMaster: 40,
    ChamberMaid: 41,
    Builder: 42,
    Senator: 43,
    Patriarch: 44,
    Taxman: 45,
    Admiral: 46,
    MinisterOfForeignAffairs: 47,
    Czarin: 48,
}
export const CardCategory = {
    Worker:0,
    Building: 1,
    Aristocrat: 2,
    Exchange: 3,
}
export const INITIAL_WORKER = []
export const Cards = new Map();

// {
//     cost:;
//     points:;
//     category:;
//     activate:;
// }
Cards.set(CardType.Lumberack, {
	type: CardType.Lumberack,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_lumberjack_EN.jpg",
    price:3,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.Goldminer, {
	type: CardType.Goldminer,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_goldminer_EN.jpg",
    price:4,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.Sheperd, {
	type: CardType.Sheperd,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_shepherd_EN.jpg",
    price:5,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.FurTrapper, {
	type: CardType.FurTrapper,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_fur_trapper_EN.jpg",
    price:6,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.ShipBuilder, {
	type: CardType.ShipBuilder,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_ship_builder_apple_EN.jpg",
    price:7,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.CzarAndCarpenter, {
	type: CardType.CzarAndCarpenter,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_czar_EN.jpg",
    price:8,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

Cards.set(CardType.Market, {
	type: CardType.Market,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_market_fish_EN.jpg",
    price:5,
    points:1,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.CustomsHouse, {
	type: CardType.CustomsHouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_customs_house_EN.jpg",
    price:8,
    points:12,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Firehouse, {
	type: CardType.Firehouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_firehouse_EN.jpg",
    price:11,
    points:3,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Hospital, {
	type: CardType.Hospital,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_hospital_EN.jpg",
    price:14,
    points:4,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Library, {
	type: CardType.Library,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_library_EN.jpg",
    price:17,
    points:5,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Theater, {
	type: CardType.Theater,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_theater_EN.jpg",
    price:20,
    points:6,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Academy, {
	type: CardType.Academy,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_academy_EN.jpg",
    price:23,
    points:7,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.PotemkinViallage, {
	type: CardType.PotemkinViallage,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_potemkin_2_6_EN.jpg",
    price:2,
    points:0,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Pub, {
	type: CardType.Pub,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_pub_EN.jpg",
    price:1,
    points:0,
    money:0,
    category:CardCategory.Building,
    action: ()=>{console.log("Pub activated")}
});

Cards.set(CardType.WareHouse, {
	type: CardType.WareHouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_warehouse_EN.jpg",
    price:2,
    points:0,
    money:0,
    category:CardCategory.Building,
});

Cards.set(CardType.Observatory, {
	type: CardType.Observatory,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_observatory_EN.jpg",
    price:7,
    points:1,
    money:0,
    category: CardCategory.Building,
    action: ()=>{console.log("Observatory activated")}
});

Cards.set(CardType.Author, {
	type: CardType.Author,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_author_EN.jpg",
    price:4,
    points:0,
    money:1,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.Administrator, {
	type: CardType.Administrator,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_administrator_EN.jpg",
    price:7,
    points:0,
    money:2,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.WarehouseManager, {
	type: CardType.WarehouseManager,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_warehouse_manager_EN.jpg",
    price:10,
    points:0,
    money:3,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.Secratary, {
	type: CardType.Secratary,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_secretary_EN.jpg",
    price:12,
    points:0,
    money:4,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.Controller, {
	type: CardType.Controller,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_controller_EN.jpg",
    price:14,
    points:1,
    money:4,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.Judge, {
	type: CardType.Judge,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_judge_EN.jpg",
    price:17,
    points:2,
    money:5,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.MistressOfCeremonies, {
	type: CardType.MistressOfCeremonies,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_mistress_EN.jpg",
    price:20,
    points:3,
    money:6,
    category: CardCategory.Aristocrat,
});

Cards.set(CardType.CarpenterWorkshop, {
	type: CardType.CarpenterWorkshop,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_carpenter_EN.jpg",
    price:4,
    points:0,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardType.Lumberack, CardType.CzarAndCarpenter],
    discount: [CardType.Building],
});

Cards.set(CardType.GoldSmelter, {
	type: CardType.GoldSmelter,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_gold_smelter_EN.jpg",
    price:6,
    points:0,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardType.Goldminer, CardType.CzarAndCarpenter],
    discount: [CardType.Aristocrat],
});

Cards.set(CardType.WeavingMill, {
	type: CardType.WeavingMill,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_weaving_mill_EN.jpg",
    price:8,
    points:0,
    money:6,
    category: CardCategory.Exchange,
    upgrades: [CardType.Sheperd, CardType.CzarAndCarpenter],
});

Cards.set(CardType.FurShop, {
	type: CardType.FurShop,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_fur_shop_EN.jpg",
    price:10,
    points:2,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardType.FurTrapper, CardType.CzarAndCarpenter],
});

Cards.set(CardType.Wharf, {
	type: CardType.Wharf,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_wharf_EN.jpg",
    price:12,
    points:1,
    money:6,
    category: CardCategory.Exchange,
    upgrades: [CardType.ShipBuilder, CardType.CzarAndCarpenter],
});

Cards.set(CardType.Bank, {
	type: CardType.Bank,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_bank_EN.jpg",
    price:13,
    points:1,
    money:5,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.Peterhof, {
	type: CardType.Peterhof,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_peterhof_EN.jpg",
    price:14,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.StIsaacsCathedral, {
	type: CardType.StIsaacsCathedral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_cathedral_EN.jpg",
    price:15,
    points:3,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.MarinksyTheater, {
	type: CardType.MarinksyTheater,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_marinsky_EN.jpg",
    price:15,
    points:(gameState)=>{return 5},
    money:0,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.ChurchOfTheResurrection, {
	type: CardType.ChurchOfTheResurrection,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_church_EN.jpg",
    price:16,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.Harbor, {
	type: CardType.Harbor,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_harbor_EN.jpg",
    price:16,
    points:2,
    money:5,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.CathedralOfTheGreatPalace, {
	type: CardType.CathedralOfTheGreatPalace,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_catherine_EN.jpg",
    price:17,
    points:5,
    money:1,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.SmolnyCathedral, {
	type: CardType.SmolnyCathedral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_smolny_EN.jpg",
    price:17,
    points:3,
    money:4,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.Hermitage, {
	type: CardType.Hermitage,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_hermitage_EN.jpg",
    price:18,
    points:4,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.WinterPalace, {
	type: CardType.WinterPalace,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_winter_palace_EN.jpg",
    price:19,
    points:5,
    money:2,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Building],
});

Cards.set(CardType.Abbot, {
	type: CardType.Abbot,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_abbot_EN.jpg",
    price:6,
    points:1,
    money:1,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.WeaponMaster, {
	type: CardType.WeaponMaster,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_weapon_master_EN.jpg",
    price:8,
    points:0,
    money:4,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.ChamberMaid, {
	type: CardType.ChamberMaid,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_chamber_maid_EN.jpg",
    price:8,
    points:2,
    money:0,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Builder, {
	type: CardType.Builder,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_builder_EN.jpg",
    price:10,
    points:0,
    money:5,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Senator, {
	type: CardType.Senator,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_senator_EN.jpg",
    price:12,
    points:2,
    money:2,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Patriarch, {
	type: CardType.Patriarch,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_patriarch_EN.jpg",
    price:16,
    points:4,
    money:0,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Taxman, {
	type: CardType.Taxman,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_tax_man_EN.jpg",
    price:17,
    points:0,
    money:(gameState)=>{return 10;},
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Admiral, {
	type: CardType.Admiral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_admiral_EN.jpg",
    price:18,
    points:3,
    money:3,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.MinisterOfForeignAffairs, {
	type: CardType.MinisterOfForeignAffairs,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_minister_EN.jpg",
    price:20,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});

Cards.set(CardType.Czarin, {
	type: CardType.Czarin,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_czarina_EN.jpg",
    price:24,
    points:6,
    money:0,
    category: CardCategory.Exchange,
    upgrades: [CardCategory.Aristocrat],
});
