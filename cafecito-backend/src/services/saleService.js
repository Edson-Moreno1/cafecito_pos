//SaleService.js

export const processSaleItems = (itemsRequest, productsInDb) => {
    let subtotal = 0;

    const saleDetails = itemsRequest.map(ItemsRequest => {
        const product = productsInDb.find(p => p._id.toString() === ItemsRequest.productId);

        const lineTotal = product.price * ItemsRequest.quantity;
        subtotal += lineTotal;
        
        return {
            productId: product._id,
            productNameSnapshot: product.name,
            unitPriceSnapshot: product.price,
            quantity: ItemsRequest.quantity,
            lineTotal: lineTotal
        }
    });
    
    return { subtotal, saleDetails };
};