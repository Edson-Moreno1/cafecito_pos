const DISCOUNT_NONE = 0 ;
const DISCOUNT_BASIC = 5 ;  // 1-3 purchases
const DISCOUNT_SILVER = 10 ; // 4-7 purchases
const DISCOUNT_GOLD = 15 ; // 8 or more purchases

export const  calculateDiscount = (purchasesCount) => {
    if (typeof purchasesCount !== 'number' || isNaN(purchasesCount) || purchasesCount < 0) {
        return DISCOUNT_NONE;
    }
    if (purchasesCount >= 8) {
        return DISCOUNT_GOLD;
    }
    if (purchasesCount >= 4){
        return DISCOUNT_SILVER;
    }
    if ( purchasesCount >=1){
        return DISCOUNT_BASIC;
    }

    return DISCOUNT_NONE;
}

export const getLoyaltyMessage = (purchasesCount) => {
    if (typeof purchasesCount !== 'number' || isNaN(purchasesCount) || purchasesCount < 0){
        return "Bienvenido a Cafecito Feliz";
    }
    if (purchasesCount >= 8) {
        return "Eres VIP. 15% en cada compra";
    }
    if (purchasesCount >= 4){
        return "¡Estás en el club 10% de descuento!";
    }
    if ( purchasesCount >=1){
        return "Tienes 5% de descuento en tu próxima compra";
    }

    return "Bienvenido a Cafecito Feliz";
};