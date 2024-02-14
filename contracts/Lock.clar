
(define-map jugada {j: principal} {hash : (buff 32)})
(define-map orden {o: uint} {j: principal} )
(define-map a_cobrar principal uint)
(define-data-var jugadores_contador uint u0)
(define-data-var booleanos_apostados int 0)
(define-data-var revelaciones uint u0)
(define-data-var yaCobraron uint u0)


(define-public (commitJugada ( hash_jugado (buff 32)) (biyuya uint))
    (begin 
        (asserts! (not (< biyuya u1000000)) (err "no seas rata"))
        (is-ok (stx-transfer? biyuya tx-sender (as-contract tx-sender)))
       
        (if (is-eq (var-get jugadores_contador) u0) (map-set orden {o:u0} {j:tx-sender}) (map-set orden {o:u1} {j:tx-sender}))

        (if (< (var-get jugadores_contador) u2)
            (begin (map-set jugada {j: tx-sender} {hash: hash_jugado}) 
                (var-set jugadores_contador (+ (var-get jugadores_contador) u1))
                (ok "Fue agregado exitosamente"))
            (err "Ya hay 2 jugadores")))
)

(define-read-only (armar_hash (apuesta bool) (numero uint))
    (sha256 (concat (unwrap-panic (to-consensus-buff? apuesta)) (unwrap-panic (to-consensus-buff? numero) ) ))
)

(define-public (revelarJugada (bool_in bool) (num uint) )
    (begin 
        (asserts! (not (is-none (map-get? jugada {j:tx-sender} ))) (err  "No sos jugador" ))
        (asserts! (is-eq (armar_hash bool_in num) (get hash (unwrap-panic (map-get? jugada {j:tx-sender} )))   )
                  (err "No seas tramposo, volve a intentarlo") )
        (var-set revelaciones (+ (var-get revelaciones) u1))
        (if (is-eq bool_in true) (var-set booleanos_apostados (+ (var-get booleanos_apostados) 1)) 
            (var-set booleanos_apostados (+ (var-get booleanos_apostados) -1)))
        (ok true)
    )
)

(define-private (getJugador (indice uint)) (get j (unwrap-panic (map-get? orden {o:indice}))))

(define-public  (resolverJugada) 
    (let (
        (primero (get j (unwrap-panic (map-get? orden {o: u0}))))
        (segundo (get j (unwrap-panic (map-get? orden {o: u1}))))) 
        (begin 
            (asserts!  (> (var-get revelaciones) u1) (err "No se puede revelar aun!")) 
            
            (if (is-eq (var-get booleanos_apostados) 0) 
                (begin (map-set a_cobrar primero  u0 ) 
                    (map-set a_cobrar segundo u2000000 ) )
                (begin (map-set a_cobrar segundo u0) 
                    (map-set a_cobrar primero u2000000 ) )
            )
        ) 
        (ok true)
    )
)

(define-public (cobrar (tu_addres principal)) 
    
    (if (>= (var-get yaCobraron) u2)
        (begin (is-ok (reiniciar)) (ok "El juego fue reiniciado"))
        (begin  
            (asserts! (is-some (map-get? a_cobrar tu_addres)) (err "No te toca cobrar!"))
            (var-set yaCobraron (+ (var-get yaCobraron) u1))
            (is-ok (as-contract (stx-transfer? (unwrap-panic (map-get? a_cobrar tu_addres)) tx-sender tu_addres)))
            (ok "Cobraste exitosamente")
        )
    )
)

(define-private (reiniciar) 
    (let ((j1 (getJugador u0)) (j2 (getJugador u1))) 
        (begin 
            (var-set jugadores_contador u0) 
            (var-set booleanos_apostados 0)
            (var-set revelaciones u0)
            (map-delete jugada {j:j1}) 
            (map-delete jugada {j:j2})    
            (map-delete a_cobrar j1)
            (map-delete a_cobrar j2)
            (var-set yaCobraron u0)
            (ok "reiniciado exitosamente")
        )
    ) 
)
(define-read-only (balance) (stx-get-balance tx-sender))