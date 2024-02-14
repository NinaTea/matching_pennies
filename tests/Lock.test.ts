
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

describe("Testing commitJugada", () => {

   it("Jugada entera de jugadores correctos gana el primero", () => {
    
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata en cuenta al iniciar del address 1");
     const response  = simnet.callPublicFn("Lock", "commitJugada", [hash_1, amount], address1);  
     (expect(response.result)).toBeOk(stringAscii("Fue agregado exitosamente"));

     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de jugar del address 1");

     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata en cuenta al iniciar del address 2");
     const response2  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address2); 
     (expect(response2.result)).toBeOk(stringAscii("Fue agregado exitosamente"));
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de jugar del address 2");
    
     const jugada1 = simnet.callPublicFn("Lock", "revelarJugada", [move1, nonce1], address1);
     expect(jugada1.result).toBeOk(boolCV(true));  

     const resuelve = simnet.callPublicFn("Lock", "resolverJugada", [], address1);
     expect(resuelve.result).toBeErr(stringAscii("No se puede revelar aun!"));

     const jugada2 = simnet.callPublicFn("Lock", "revelarJugada", [move2, nonce2], address2);
     expect(jugada2.result).toBeOk(boolCV(true));  


     const resuelve2 = simnet.callPublicFn("Lock", "resolverJugada", [], address2);
     expect(resuelve2.result).toBeOk(boolCV(true));
 
     const cobrar1 = simnet.callPublicFn("Lock", "cobrar", [principalCV(address1)], address1);
     expect(cobrar1.result).toBeOk(stringAscii("Cobraste exitosamente"))
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de cobrar del address1");
    
     const cobrar2 = simnet.callPublicFn("Lock", "cobrar", [principalCV(address2)], address2);
     expect(cobrar2.result).toBeOk(stringAscii("Cobraste exitosamente"));
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de cobrar del address2");
   });
  

   it("Jugada entera de jugadores correctos gana el segundo", () => {

    const move2  = boolCV(true);
    const nonce2  = uintCV(8254);
    const hash_2 = simnet.callReadOnlyFn("Lock", "armar_hash", [move2, nonce2], address2).result;

    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata en cuenta al iniciar del address 1");
     const response  = simnet.callPublicFn("Lock", "commitJugada", [hash_1, amount], address1);  
     (expect(response.result)).toBeOk(stringAscii("Fue agregado exitosamente"));

     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de jugar del address 1");

     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata en cuenta al iniciar del address 2");
     const response2  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address2); 
     (expect(response2.result)).toBeOk(stringAscii("Fue agregado exitosamente"));
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de jugar del address 2");
    
     const jugada1 = simnet.callPublicFn("Lock", "revelarJugada", [move1, nonce1], address1);
     expect(jugada1.result).toBeOk(boolCV(true));  

     const resuelve = simnet.callPublicFn("Lock", "resolverJugada", [], address1);
     expect(resuelve.result).toBeErr(stringAscii("No se puede revelar aun!"));

     const jugada2 = simnet.callPublicFn("Lock", "revelarJugada", [move2, nonce2], address2);
     expect(jugada2.result).toBeOk(boolCV(true));  


     const resuelve2 = simnet.callPublicFn("Lock", "resolverJugada", [], address2);
     expect(resuelve2.result).toBeOk(boolCV(true));
 
     const cobrar1 = simnet.callPublicFn("Lock", "cobrar", [principalCV(address1)], address1);
     expect(cobrar1.result).toBeOk(stringAscii("Cobraste exitosamente"))
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de cobrar del address1");
    
     const cobrar2 = simnet.callPublicFn("Lock", "cobrar", [principalCV(address2)], address2);
     expect(cobrar2.result).toBeOk(stringAscii("Cobraste exitosamente"));
     console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de cobrar del address2");
  });


  it("Jugada entera el primero hace trampa", () => {
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata en cuenta al iniciar del address 1");
    const response  = simnet.callPublicFn("Lock", "commitJugada", [hash_1, amount], address1);  
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de jugar del address 1");

    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata en cuenta al iniciar del address 2");
    const response2  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address2); 
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de jugar del address 2");

    const jugada1 = simnet.callPublicFn("Lock", "revelarJugada", [move1, uintCV(5678)], address1);
    expect(jugada1.result).toBeErr(stringAscii("No seas tramposo, volve a intentarlo"));
   
    const jugada2 = simnet.callPublicFn("Lock", "revelarJugada", [move2, nonce2], address2);
    expect(jugada2.result).toBeOk(boolCV(true));
   
  });

  it("Jugada entera el segundo hace trampa", () => {
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata en cuenta al iniciar del address 1");
    const response  = simnet.callPublicFn("Lock", "commitJugada", [hash_1, amount], address1);  
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de jugar del address 1");

    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata en cuenta al iniciar del address 2");
    const response2  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address2); 
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de jugar del address 2");

    const jugada1 = simnet.callPublicFn("Lock", "revelarJugada", [move1, nonce1], address1);
    expect(jugada1.result).toBeOk(boolCV(true));
   
    const jugada2 = simnet.callPublicFn("Lock", "revelarJugada", [move2, uintCV(1234)], address2);
    expect(jugada2.result).toBeErr(stringAscii("No seas tramposo, volve a intentarlo"));
   
  });

  it("Un tercero quiere jugar", () => {
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata en cuenta al iniciar del address 1");
    const response  = simnet.callPublicFn("Lock", "commitJugada", [hash_1, amount], address1);  
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address1).result, "Plata después de jugar del address 1");

    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata en cuenta al iniciar del address 2");
    const response2  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address2); 
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address2).result, "Plata después de jugar del address 2");

    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address4).result, "Plata en cuenta al iniciar del address 4");
    const response4  = simnet.callPublicFn("Lock", "commitJugada", [hash_2, amount], address4); 
    expect(response4.result).toBeErr(stringAscii("Ya hay 2 jugadores"));
    console.log(simnet.callReadOnlyFn("Lock", "balance", [], address4).result, "Plata después de jugar del address 4");

    // const jugada1 = simnet.callPublicFn("Lock", "revelarJugada", [move1, nonce1], address1);
    // expect(jugada1.result).toBeOk(boolCV(true));
   
    // const jugada2 = simnet.callPublicFn("Lock", "revelarJugada", [move2, uintCV(1234)], address2);
    // expect(jugada2.result).toBeErr(stringAscii("No seas tramposo, volve a intentarlo"));
   
  });


});
