import { describe, expect, it } from 'vitest';
import { CalculateShippingPrice, CalculateTotalPrice } from '../../../helpers/utils/transaction/transactionHelper';

describe('Transaction Helper Functions', () => {
 describe('CalculateShippingPrice', () => {
   it('should calculate shipping price correctly', () => {
     const params = {
       expedition_name: "JNE",
       shipping_address_id: 1
     };

     const result = CalculateShippingPrice(params);

     expect(result).toEqual(350); // Assuming the cost for JNE is 350
   });

   it('should throw an error for unknown courier', () => {
     const params = {
       expedition_name: "Unknown Courier",
       shipping_address_id: 1
     };

     expect(() => CalculateShippingPrice(params)).toThrowError('Unknown courier: Unknown Courier');
   });
 });

 describe('CalculateTotalPrice', () => {
   it('should calculate total price correctly', () => {
     const params = {
       items_price: 100,
       shipping_price: 200
     };

     const result = CalculateTotalPrice(params);

     expect(result).toEqual('300.00');
   });
 });
});