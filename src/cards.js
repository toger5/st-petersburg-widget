import { CARDS, CardType } from "./cardIndex";

export const CardCategory = {
    Worker:0,
    Building: 1,
    Aristocrat: 2,
    Exchange: 3,
}

export const Cards = {
    byId: (id) => cardsByType.get(CARDS[id]),
    byType: (type) => cardsByType.get(type),
}

const cardsByType = new Map();


cardsByType.set(CardType.Lumberack, {
	type: CardType.Lumberack,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_lumberjack_EN.jpg",
    price:3,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.Goldminer, {
	type: CardType.Goldminer,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_goldminer_EN.jpg",
    price:4,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.Sheperd, {
	type: CardType.Sheperd,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_shepherd_EN.jpg",
    price:5,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.FurTrapper, {
	type: CardType.FurTrapper,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_fur_trapper_EN.jpg",
    price:6,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.ShipBuilder, {
	type: CardType.ShipBuilder,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_ship_builder_apple_EN.jpg",
    price:7,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.CzarAndCarpenter, {
	type: CardType.CzarAndCarpenter,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/worker_czar_EN.jpg",
    price:8,
    points:0,
    money:3,
    category:CardCategory.Worker,
});

cardsByType.set(CardType.Market, {
	type: CardType.Market,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_market_fish_EN.jpg",
    price:5,
    points:1,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.CustomsHouse, {
	type: CardType.CustomsHouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_customs_house_EN.jpg",
    price:8,
    points:12,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Firehouse, {
	type: CardType.Firehouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_firehouse_EN.jpg",
    price:11,
    points:3,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Hospital, {
	type: CardType.Hospital,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_hospital_EN.jpg",
    price:14,
    points:4,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Library, {
	type: CardType.Library,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_library_EN.jpg",
    price:17,
    points:5,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Theater, {
	type: CardType.Theater,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_theater_EN.jpg",
    price:20,
    points:6,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Academy, {
	type: CardType.Academy,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_academy_EN.jpg",
    price:23,
    points:7,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.PotemkinViallage, {
	type: CardType.PotemkinViallage,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_potemkin_2_6_EN.jpg",
    price:2,
    exchangePrice: 6,
    points:0,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Pub, {
	type: CardType.Pub,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_pub_EN.jpg",
    price:1,
    points:0,
    money:0,
    category:CardCategory.Building,
    action: (gs, turn)=>{
        let factor = turn.payload.activationCount;
        let curP = gs.getCurrentPlayer();
        curP.money -= factor * 2
        curP.points += factor
        console.log("Pub activated")
    },
    getActionPayload: (gs) => {
        const p = new Promise((resolve) => {
            window.Actions.selectPubActivationCount(Math.min(5,Math.floor(gs.getCurrentPlayer().money/2))).then(
                (activationCount)=>{
                    resolve({activationCount:activationCount});
                }
            )
        });
        return p;
    }
});

cardsByType.set(CardType.WareHouse, {
	type: CardType.WareHouse,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_warehouse_EN.jpg",
    price:2,
    points:0,
    money:0,
    category:CardCategory.Building,
});

cardsByType.set(CardType.Observatory, {
	type: CardType.Observatory,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/building_observatory_EN.jpg",
    price:7,
    points:1,
    money:0,
    category: CardCategory.Building,
    action: ()=>{console.log("Observatory activated")}
});

cardsByType.set(CardType.Author, {
	type: CardType.Author,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_author_EN.jpg",
    price:4,
    points:0,
    money:1,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Administrator, {
	type: CardType.Administrator,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_administrator_EN.jpg",
    price:7,
    points:0,
    money:2,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.WarehouseManager, {
	type: CardType.WarehouseManager,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_warehouse_manager_EN.jpg",
    price:10,
    points:0,
    money:3,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Secratary, {
	type: CardType.Secratary,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_secretary_EN.jpg",
    price:12,
    points:0,
    money:4,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Controller, {
	type: CardType.Controller,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_controller_EN.jpg",
    price:14,
    points:1,
    money:4,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Judge, {
	type: CardType.Judge,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_judge_EN.jpg",
    price:17,
    points:2,
    money:5,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.MistressOfCeremonies, {
	type: CardType.MistressOfCeremonies,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/aristocrat_mistress_EN.jpg",
    price:20,
    points:3,
    money:6,
    category: CardCategory.Aristocrat,
});

cardsByType.set(CardType.CarpenterWorkshop, {
	type: CardType.CarpenterWorkshop,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_carpenter_EN.jpg",
    price:4,
    points:0,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Worker,
    upgradeCards: [CardType.Lumberack, CardType.CzarAndCarpenter],
    discountCategory: CardType.Building,
});

cardsByType.set(CardType.GoldSmelter, {
	type: CardType.GoldSmelter,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_gold_smelter_EN.jpg",
    price:6,
    points:0,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Worker,
    upgradeCards: [CardType.Goldminer, CardType.CzarAndCarpenter],
    discountCategory: CardType.Aristocrat,
});

cardsByType.set(CardType.WeavingMill, {
	type: CardType.WeavingMill,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_weaving_mill_EN.jpg",
    price:8,
    points:0,
    money:6,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Worker,
    upgradeCards: [CardType.Sheperd, CardType.CzarAndCarpenter],
});

cardsByType.set(CardType.FurShop, {
	type: CardType.FurShop,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_fur_shop_EN.jpg",
    price:10,
    points:2,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Worker,
    upgradeCards: [CardType.FurTrapper, CardType.CzarAndCarpenter],
});

cardsByType.set(CardType.Wharf, {
	type: CardType.Wharf,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_wharf_EN.jpg",
    price:12,
    points:1,
    money:6,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Worker,
    upgradeCards: [CardType.ShipBuilder, CardType.CzarAndCarpenter],
});

cardsByType.set(CardType.Bank, {
	type: CardType.Bank,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_bank_EN.jpg",
    price:13,
    points:1,
    money:5,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.Peterhof, {
	type: CardType.Peterhof,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_peterhof_EN.jpg",
    price:14,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.StIsaacsCathedral, {
	type: CardType.StIsaacsCathedral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_cathedral_EN.jpg",
    price:15,
    points:3,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.MarinksyTheater, {
	type: CardType.MarinksyTheater,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_marinsky_EN.jpg",
    price:15,
    points:(gameState)=>{return 5},
    money:0,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.ChurchOfTheResurrection, {
	type: CardType.ChurchOfTheResurrection,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_church_EN.jpg",
    price:16,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.Harbor, {
	type: CardType.Harbor,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_harbor_EN.jpg",
    price:16,
    points:2,
    money:5,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.CathedralOfTheGreatPalace, {
	type: CardType.CathedralOfTheGreatPalace,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_catherine_EN.jpg",
    price:17,
    points:5,
    money:1,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.SmolnyCathedral, {
	type: CardType.SmolnyCathedral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_smolny_EN.jpg",
    price:17,
    points:3,
    money:4,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.Hermitage, {
	type: CardType.Hermitage,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_hermitage_EN.jpg",
    price:18,
    points:4,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.WinterPalace, {
	type: CardType.WinterPalace,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_winter_palace_EN.jpg",
    price:19,
    points:5,
    money:2,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Building,
});

cardsByType.set(CardType.Abbot, {
	type: CardType.Abbot,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_abbot_EN.jpg",
    price:6,
    points:1,
    money:1,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.WeaponMaster, {
	type: CardType.WeaponMaster,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_weapon_master_EN.jpg",
    price:8,
    points:0,
    money:4,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.ChamberMaid, {
	type: CardType.ChamberMaid,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_chamber_maid_EN.jpg",
    price:8,
    points:2,
    money:0,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Builder, {
	type: CardType.Builder,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_builder_EN.jpg",
    price:10,
    points:0,
    money:5,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Senator, {
	type: CardType.Senator,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_senator_EN.jpg",
    price:12,
    points:2,
    money:2,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Patriarch, {
	type: CardType.Patriarch,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_patriarch_EN.jpg",
    price:16,
    points:4,
    money:0,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Taxman, {
	type: CardType.Taxman,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_tax_man_EN.jpg",
    price:17,
    points:0,
    money:(gameState)=>{return 10;},
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Admiral, {
	type: CardType.Admiral,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_admiral_EN.jpg",
    price:18,
    points:3,
    money:3,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.MinisterOfForeignAffairs, {
	type: CardType.MinisterOfForeignAffairs,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_minister_EN.jpg",
    price:20,
    points:4,
    money:2,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});

cardsByType.set(CardType.Czarin, {
	type: CardType.Czarin,
    image: "https://www.yucata.de/Games/SaintPetersburg2/images/exchange_czarina_EN.jpg",
    price:24,
    points:6,
    money:0,
    category: CardCategory.Exchange,
    upgradeCategory: CardCategory.Aristocrat,
});
