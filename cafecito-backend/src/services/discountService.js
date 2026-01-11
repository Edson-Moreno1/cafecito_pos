

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