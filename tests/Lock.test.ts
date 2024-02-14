
import { describe, expect, expectTypeOf, it} from "vitest";
import crypto from "crypto";
import { uintCV, bufferCVFromString, boolCV, principalCV, stringAsciiCV, trueCV, ClarityType, bufferCV } from "@stacks/transactions";
import { buffer, bufferFromAscii, bufferFromHex, stringAscii } from "@stacks/transactions/dist/cl";
const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;
const accounts1 = simnet.getAccounts();
const address4 = accounts1.get("wallet_4")!;

ClarityType
const move1  = boolCV(false);
const nonce1  = uintCV(1234);
const amount = uintCV(1000000);

const hash_1 = simnet.callReadOnlyFn("Lock", "armar_hash", [move1, nonce1], address1).result;

const move2  = boolCV(false);
const nonce2  = uintCV(8254);
const hash_2 = simnet.callReadOnlyFn("Lock", "armar_hash", [move2, nonce2], address2).result;

/*
  The test below is an example. To learn more, read the testing documentation here:
  https://docs.hiro.so/clarinet/feature-guides/test-contract-with-clarinet-sdk
*/

describe("Testing matching_pennies", () => {

   it("An entire game played, first wins", () => {
    
     const response  = simnet.callPublicFn("Lock", "commit_play", [hash_1, amount], address1);  
     (expect(response.result)).toBeOk(stringAscii("Successfully added"));
   
     const response2  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address2); 
     (expect(response2.result)).toBeOk(stringAscii("Successfully added"));
    
     const jugada1 = simnet.callPublicFn("Lock", "show_my_play", [move1, nonce1], address1);
     expect(jugada1.result).toBeOk(boolCV(true));  

     const resuelve = simnet.callPublicFn("Lock", "endPlay", [], address1);
     expect(resuelve.result).toBeErr(stringAscii("It can not be reveal yet!"));

     const jugada2 = simnet.callPublicFn("Lock", "show_my_play", [move2, nonce2], address2);
     expect(jugada2.result).toBeOk(boolCV(true));  

     const resuelve2 = simnet.callPublicFn("Lock", "endPlay", [], address2);
     expect(resuelve2.result).toBeOk(boolCV(true));
 
     const cobrar1 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address1)], address1);
     expect(cobrar1.result).toBeOk(stringAscii("Everything went smoothly"))

     //const cobrar1 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address1)], address1);
     //expect(cobrar1.result).toBeOk(stringAscii("Everything went smoothly"))
    
     //const cobrar2 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address2)], address2);
     //expect(cobrar2.result).toBeOk(stringAscii("Everything went smoothly"));

     //const cobrar3 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address1)], address1);
     //expect(cobrar3.result).toBeOk(stringAscii("The game was restarted"))

     const cobrar4 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address1)], address1);
     expect(cobrar4.result).toBeErr(stringAscii("You did not play or you already got your prize!"))

   });
  

   it("An entire game played, second wins", () => {

    const move2  = boolCV(true);
    const nonce2  = uintCV(8254);
    const hash_2 = simnet.callReadOnlyFn("Lock", "armar_hash", [move2, nonce2], address2).result;

     const response  = simnet.callPublicFn("Lock", "commit_play", [hash_1, amount], address1);  
     (expect(response.result)).toBeOk(stringAscii("Successfully added"));

     const response2  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address2); 
     (expect(response2.result)).toBeOk(stringAscii("Successfully added"));
    
     const jugada1 = simnet.callPublicFn("Lock", "show_my_play", [move1, nonce1], address1);
     expect(jugada1.result).toBeOk(boolCV(true));  

     const resuelve = simnet.callPublicFn("Lock", "endPlay", [], address1);
     expect(resuelve.result).toBeErr(stringAscii("It can not be reveal yet!"));

     const jugada2 = simnet.callPublicFn("Lock", "show_my_play", [move2, nonce2], address2);
     expect(jugada2.result).toBeOk(boolCV(true));  

     const resuelve2 = simnet.callPublicFn("Lock", "endPlay", [], address2);
     expect(resuelve2.result).toBeOk(boolCV(true));
 
     const cobrar1 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address1)], address1);
     expect(cobrar1.result).toBeOk(stringAscii("Everything went smoothly"))
    
     const cobrar2 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address2)], address2);
     expect(cobrar2.result).toBeOk(stringAscii("Everything went smoothly"));

  });


  it("First cheats", () => {
   
    const response  = simnet.callPublicFn("Lock", "commit_play", [hash_1, amount], address1);  
    
    const response2  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address2); 

    const jugada1 = simnet.callPublicFn("Lock", "show_my_play", [move1, uintCV(5678)], address1);
    expect(jugada1.result).toBeErr(stringAscii("Do not cheat, try again"));
   
    const jugada2 = simnet.callPublicFn("Lock", "show_my_play", [move2, nonce2], address2);
    expect(jugada2.result).toBeOk(boolCV(true));
   
  });

  it("Second cheats", () => {
   
    const response  = simnet.callPublicFn("Lock", "commit_play", [hash_1, amount], address1);  
    const response2  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address2); 

    const jugada1 = simnet.callPublicFn("Lock", "show_my_play", [move1, nonce1], address1);
    expect(jugada1.result).toBeOk(boolCV(true));
   
    const jugada2 = simnet.callPublicFn("Lock", "show_my_play", [move2, uintCV(1234)], address2);
    expect(jugada2.result).toBeErr(stringAscii("Do not cheat, try again"));
   
  });

  it("A third player wants to play", () => {
   
    const response  = simnet.callPublicFn("Lock", "commit_play", [hash_1, amount], address1);  
    const response2  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address2); 
    const response4  = simnet.callPublicFn("Lock", "commit_play", [hash_2, amount], address4); 
    expect(response4.result).toBeErr(stringAscii("There are already two players!"));
   
  });

  it("Someone who did not play wants to get the prize", () => {
    const jugada2 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address2)], address2);
    expect(jugada2.result).toBeErr(stringAscii("You did not play or you already got your prize!"));

    const jugada3 = simnet.callPublicFn("Lock", "get_prize", [principalCV(address2)], address2);
    expect(jugada3.result).toBeErr(stringAscii("You did not play or you already got your prize!"));
  });
});
