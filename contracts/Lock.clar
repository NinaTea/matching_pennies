
(define-map play {j: principal} {hash : (buff 32)})
(define-map sorted {o: uint} {j: principal} )
(define-map to_pay  principal uint)
(define-data-var players_counter  uint u0)
(define-data-var  booleans_played int 0)
(define-data-var revelations uint u0)
(define-data-var already_payed_them uint u0)


(define-public (commit_play ( hash_played (buff 32)) (amount uint))
    (begin 
        (asserts! (not (< amount u1000000)) (err "You have to pay 1 STX"))
        (is-ok (stx-transfer? amount tx-sender (as-contract tx-sender)))
       
        (if (is-eq (var-get players_counter ) u0) (map-set sorted {o:u0} {j:tx-sender}) (map-set sorted {o:u1} {j:tx-sender}))

        (if (< (var-get players_counter ) u2)
            (begin (map-set play {j: tx-sender} {hash: hash_played}) 
                (var-set players_counter  (+ (var-get players_counter ) u1))
                (ok "Successfully added"))
            (err "There are already two players!")))
)

(define-read-only (armar_hash (apuesta bool) (numero uint))
    (sha256 (concat (unwrap-panic (to-consensus-buff? apuesta)) (unwrap-panic (to-consensus-buff? numero) ) ))
)

(define-public (show_my_play (bool_in bool) (num uint) )
    (begin 
        (asserts! (not (is-none (map-get? play {j:tx-sender} ))) (err  "You are not a player" ))
        (asserts! (is-eq (armar_hash bool_in num) (get hash (unwrap-panic (map-get? play {j:tx-sender} )))   )
                  (err "Do not cheat, try again") )
        (var-set revelations (+ (var-get revelations ) u1))
        (if (is-eq bool_in true) (var-set  booleans_played (+ (var-get booleans_played) 1)) 
            (var-set  booleans_played (+ (var-get booleans_played) -1)))
        (ok true)
    )
)

(define-private (getJugador (indice uint)) (get j (unwrap-panic (map-get? sorted {o:indice}))))

(define-public  (endPlay) 
    (let (
        (primero (get j (unwrap-panic (map-get? sorted {o: u0}))))
        (segundo (get j (unwrap-panic (map-get? sorted {o: u1}))))) 
        (begin 
            (asserts!  (> (var-get revelations ) u1) (err "It can not be reveal yet!")) 
            
            (if (is-eq (var-get booleans_played) 0) 
                (begin (map-set to_pay  primero  u0 ) 
                    (map-set to_pay  segundo u2000000 ) )
                (begin (map-set to_pay  segundo u0) 
                    (map-set to_pay  primero u2000000 ) )
            )
        ) 
        (ok true)
    )
)

(define-public (get_prize (tu_addres principal)) 
    
    (if (>= (var-get already_payed_them) u2)
        (begin (is-ok (restart)) (ok "The game was restarted"))
        (begin  
            (asserts! (is-some (map-get? to_pay  tu_addres)) (err "You did not play"))
            (var-set already_payed_them (+ (var-get already_payed_them) u1))
            (is-ok (as-contract (stx-transfer? (unwrap-panic (map-get? to_pay  tu_addres)) tx-sender tu_addres)))
            (ok "Successfull stx-transfer")
        )
    )
)

(define-private (restart) 
    (let ((j1 (getJugador u0)) (j2 (getJugador u1))) 
        (begin 
            (var-set players_counter  u0) 
            (var-set  booleans_played 0)
            (var-set revelations u0)
            (map-delete play {j:j1}) 
            (map-delete play {j:j2})    
            (map-delete to_pay  j1)
            (map-delete to_pay  j2)
            (var-set already_payed_them u0)
            (ok "Successfull restoration")
        )
    ) 
)
(define-read-only (balance) (stx-get-balance tx-sender))