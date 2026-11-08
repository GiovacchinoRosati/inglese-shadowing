/* Curriculum B1 → C1. Ogni unità: f = forma, u = uso, t = trappola per italofoni.
   s = [inglese, italiano, nota sul significato]. Frasi originali scritte per l'app. */
"use strict";

const LEVELS = {
  B1: "Autonomia nel quotidiano e al lavoro: tempi base, futuro, condizionali 0-1-2, modali, passivo, strutture ad alta frequenza.",
  B2: "Precisione e sfumature: past perfect, futuri complessi, condizionali 3 e misti, discorso indiretto, deduzioni al passato, connettivi.",
  C1: "Registro e stile: inversioni, frasi scisse, congiuntivo formale, participiali, hedging, collocazioni, idiomi, marcatori del discorso."
};

const UNITS = [
/* ============================ B1 ============================ */
{ id:"b1-01", level:"B1", title:"Present simple vs present continuous", yt:"present simple vs present continuous",
  f:"Simple: I work / she works. Continuous: I'm working / she's working.",
  u:"Simple per abitudini, fatti e stati. Continuous per azioni in corso ora, situazioni temporanee e appuntamenti già fissati.",
  t:"I verbi di stato (know, want, need, understand, like) non vanno al continuous: mai \"I'm knowing\".",
  s:[
  ["I usually take the train, but this week I'm driving to work.","Di solito prendo il treno, ma questa settimana vado al lavoro in macchina.","usually = abitudine (simple); this week = situazione temporanea (continuous)."],
  ["What do you do? — I'm an engineer, but right now I'm working on a robotics project.","Che lavoro fai? — Sono ingegnere, ma adesso sto lavorando a un progetto di robotica.","\"What do you do?\" chiede il mestiere, non cosa stai facendo in questo momento."],
  ["She doesn't understand why the meeting is taking so long.","Non capisce perché la riunione stia durando così tanto.","understand è uno stato → simple; take so long è in corso → continuous."],
  ["Prices are going up every month.","I prezzi stanno salendo ogni mese.","Continuous per un cambiamento in atto."],
  ["I'm meeting the client on Friday at ten.","Vedo il cliente venerdì alle dieci.","Appuntamento fissato: l'italiano usa il presente, l'inglese il continuous."],
  ["Water boils at a hundred degrees.","L'acqua bolle a cento gradi.","Fatto scientifico → simple."]
]},
{ id:"b1-02", level:"B1", title:"Past simple vs past continuous", yt:"past simple vs past continuous",
  f:"Simple: I called. Continuous: I was calling.",
  u:"Continuous per l'azione lunga o lo sfondo; simple per l'evento breve che la interrompe o per una sequenza di azioni.",
  t:"L'imperfetto italiano non è sempre past continuous: \"da piccolo giocavo\" = I used to play / I played.",
  s:[
  ["I was driving home when my phone rang.","Stavo tornando a casa in macchina quando ha squillato il telefono.","Azione lunga interrotta (continuous) + evento breve (simple)."],
  ["While we were waiting for the results, the server crashed.","Mentre aspettavamo i risultati, il server si è bloccato.","while + continuous per lo sfondo."],
  ["She opened the email, read it and called me immediately.","Ha aperto l'email, l'ha letta e mi ha chiamato subito.","Sequenza di azioni → tutte al simple."],
  ["At eight o'clock last night I was still working on the report.","Ieri sera alle otto stavo ancora lavorando al report.","Azione in corso in un momento preciso del passato."],
  ["It was raining, so we didn't go out.","Pioveva, quindi non siamo usciti.","Descrizione (continuous) + fatto concluso (simple)."],
  ["Did you see the match yesterday?","Hai visto la partita ieri?","yesterday = tempo concluso → past simple, mai present perfect."]
]},
{ id:"b1-03", level:"B1", title:"Present perfect vs past simple", yt:"present perfect vs past simple",
  f:"have/has + participio: I've seen, she's gone.",
  u:"Present perfect per esperienze, risultati attuali, periodi non conclusi. Past simple per un momento finito e dichiarato (yesterday, in 2020, last week).",
  t:"\"Vivo qui da dieci anni\" = I've lived here for ten years, non \"I live here since\".",
  s:[
  ["I've lived in Rome for ten years.","Vivo a Roma da dieci anni.","Presente italiano + \"da\" = present perfect + for."],
  ["I've never been to Japan.","Non sono mai stato in Giappone.","Esperienza di vita senza momento preciso. been to = andato e tornato."],
  ["Have you finished the report yet? — Not yet, I've just started.","Hai già finito il report? — Non ancora, ho appena iniziato.","yet in domande e negazioni; just = appena."],
  ["We signed the contract last March.","Abbiamo firmato il contratto lo scorso marzo.","Momento finito → past simple, anche se in italiano usi il passato prossimo."],
  ["She's already sent the documents.","Ha già inviato i documenti.","already va tra ausiliare e participio."],
  ["How long have you known each other?","Da quanto tempo vi conoscete?","\"Da quanto tempo\" = How long + present perfect."]
]},
{ id:"b1-04", level:"B1", title:"Present perfect continuous (for / since)", yt:"present perfect continuous for since",
  f:"have/has been + -ing: I've been waiting.",
  u:"Attività iniziata nel passato e ancora in corso, o appena terminata con effetti visibili. for = durata, since = punto di partenza.",
  t:"Simple = risultato (I've read the book); continuous = attività (I've been reading the book).",
  s:[
  ["I've been waiting for you for half an hour.","Ti aspetto da mezz'ora.","for + durata."],
  ["It's been raining since this morning.","Piove da stamattina.","since + punto di partenza."],
  ["You look tired. Have you been working all night?","Sembri stanco. Hai lavorato tutta la notte?","Effetto visibile ora di un'attività recente."],
  ["We've been testing the new drone for three weeks.","Stiamo testando il nuovo drone da tre settimane.","\"Stiamo facendo da...\" = present perfect continuous."],
  ["I've been reading that book, but I haven't finished it.","Sto leggendo quel libro, ma non l'ho finito.","Continuous = attività; simple = risultato."],
  ["How long have you been studying English?","Da quanto tempo studi inglese?","Domanda tipica sulla durata."]
]},
{ id:"b1-05", level:"B1", title:"Il futuro: will, going to, present continuous", yt:"will vs going to future",
  f:"will + base; be going to + base; be + -ing; present simple per gli orari.",
  u:"will = previsione, decisione presa sul momento, promessa. going to = intenzione o evidenza. Continuous = programma fissato.",
  t:"Il presente italiano per il futuro va quasi sempre reso con continuous o going to, non con il present simple.",
  s:[
  ["I think it'll rain later.","Credo che pioverà più tardi.","Opinione/previsione → will."],
  ["Look at those clouds! It's going to rain.","Guarda quelle nuvole! Sta per piovere.","Evidenza presente → going to."],
  ["I'm going to change jobs next year.","Ho intenzione di cambiare lavoro l'anno prossimo.","Intenzione già decisa."],
  ["The phone's ringing. — Don't worry, I'll get it.","Squilla il telefono. — Tranquillo, rispondo io.","Decisione presa sul momento → will."],
  ["We're flying to Milan on Monday morning.","Lunedì mattina voliamo a Milano.","Programma fissato → present continuous."],
  ["The train leaves at 7:15.","Il treno parte alle 7:15.","Orari ufficiali → present simple."]
]},
{ id:"b1-06", level:"B1", title:"Zero e first conditional", yt:"zero and first conditional",
  f:"Zero: if + present, present. First: if + present, will + base.",
  u:"Zero per verità generali; first per situazioni reali e probabili nel futuro.",
  t:"Mai will dopo if, when, as soon as, until, unless: \"as soon as I arrive\", non \"will arrive\".",
  s:[
  ["If you heat ice, it melts.","Se scaldi il ghiaccio, si scioglie.","Zero conditional: legge generale."],
  ["If it rains tomorrow, we'll postpone the site visit.","Se domani piove, rinvieremo il sopralluogo.","if + present, will."],
  ["I'll call you as soon as I arrive.","Ti chiamo appena arrivo.","as soon as + present con valore futuro."],
  ["Unless we leave now, we'll miss the train.","Se non partiamo adesso, perderemo il treno.","unless = if not."],
  ["If you need anything, just let me know.","Se ti serve qualcosa, fammi sapere.","if + present + imperativo."],
  ["We won't start until everyone is here.","Non cominceremo finché non ci sono tutti.","until + present; niente doppia negazione."]
]},
{ id:"b1-07", level:"B1", title:"Second conditional", yt:"second conditional",
  f:"if + past simple, would + base.",
  u:"Situazioni ipotetiche o improbabili nel presente o nel futuro. Corrisponde a \"se + congiuntivo imperfetto, condizionale\".",
  t:"Mai would nella frase con if: \"If I had\", non \"If I would have\".",
  s:[
  ["If I had more time, I'd learn to play the piano.","Se avessi più tempo, imparerei a suonare il pianoforte.","had = avessi; I'd = I would."],
  ["If I were you, I'd accept the offer.","Se fossi in te, accetterei l'offerta.","\"If I were you\": formula fissa per dare consigli."],
  ["What would you do if you lost your job?","Cosa faresti se perdessi il lavoro?","Domanda ipotetica."],
  ["If we didn't have this deadline, we could take a break.","Se non avessimo questa scadenza, potremmo fare una pausa.","could = potremmo."],
  ["I wouldn't say that if I weren't sure.","Non lo direi se non ne fossi sicuro.","weren't anche per I/he/she nel registro curato."],
  ["It would be great if you could join us.","Sarebbe fantastico se potessi unirti a noi.","Formula cortese di invito."]
]},
{ id:"b1-08", level:"B1", title:"Obbligo: must, have to, don't have to, mustn't, should", yt:"must have to mustn't don't have to",
  f:"must / have to + base; don't have to; mustn't; should.",
  u:"must = obbligo forte o regola; have to = obbligo esterno; don't have to = non è necessario; mustn't = divieto; should = consiglio.",
  t:"don't have to ≠ mustn't. \"You don't have to come\" = non sei obbligato; \"You mustn't come\" = non devi venire.",
  s:[
  ["You must wear a helmet on the construction site.","Devi indossare il casco in cantiere.","Regola obbligatoria."],
  ["I have to leave early today; I've got a doctor's appointment.","Oggi devo uscire presto; ho un appuntamento dal medico.","Obbligo dovuto alle circostanze."],
  ["You don't have to come if you don't want to.","Non sei obbligato a venire se non vuoi.","Assenza di obbligo."],
  ["You mustn't tell anyone about this.","Non devi dirlo a nessuno.","Divieto."],
  ["Did you have to work last weekend?","Hai dovuto lavorare lo scorso weekend?","must non ha il passato: si usa had to."],
  ["You should check the figures before sending them.","Dovresti controllare i numeri prima di inviarli.","should = \"dovresti\", consiglio."]
]},
{ id:"b1-09", level:"B1", title:"Deduzione al presente: must, might, can't", yt:"modal verbs of deduction present",
  f:"must / might / may / could / can't + be (o altro verbo).",
  u:"must = sono quasi certo; might/may/could = è possibile; can't = è impossibile.",
  t:"L'italiano usa spesso il futuro (\"sarà in riunione\"): in inglese è must be. Il contrario di must qui è can't, non mustn't.",
  s:[
  ["He's not answering. He must be in a meeting.","Non risponde. Sarà in riunione.","Futuro di supposizione italiano = must."],
  ["That can't be right. Check the numbers again.","Non può essere giusto. Ricontrolla i numeri.","can't = impossibile."],
  ["She might be at home, but I'm not sure.","Potrebbe essere a casa, ma non sono sicuro.","Possibilità."],
  ["They may not know about the change yet.","Forse non sanno ancora del cambiamento.","may not = forse no."],
  ["You must be exhausted after such a long flight.","Sarai distrutto dopo un volo così lungo.","Deduzione empatica, molto usata."],
  ["It could be a software problem.","Potrebbe essere un problema di software.","could = ipotesi."]
]},
{ id:"b1-10", level:"B1", title:"Comparativi e superlativi", yt:"comparatives and superlatives",
  f:"-er / more ... than; the -est / the most; as ... as; the same ... as.",
  u:"Confrontare persone, oggetti, opzioni. much / far rafforzano il comparativo.",
  t:"\"di\" nel paragone = than, non of: faster than the old one.",
  s:[
  ["This version is much faster than the old one.","Questa versione è molto più veloce di quella vecchia.","much + comparativo = molto più."],
  ["It's the most reliable system we've ever used.","È il sistema più affidabile che abbiamo mai usato.","Superlativo + present perfect + ever."],
  ["The second option isn't as expensive as the first.","La seconda opzione non è cara quanto la prima.","not as ... as = non ... quanto."],
  ["Things are getting better and better.","Le cose vanno sempre meglio.","Comparativo ripetuto = sempre più."],
  ["Could you speak a bit more slowly, please?","Potresti parlare un po' più lentamente, per favore?","Frase di sopravvivenza da avere pronta."],
  ["He's the same age as my brother.","Ha la stessa età di mio fratello.","the same ... as."]
]},
{ id:"b1-11", level:"B1", title:"Il passivo (presente, passato, futuro)", yt:"passive voice english",
  f:"be + participio: is built, was built, will be built, is being built, has been built.",
  u:"Quando conta l'azione o il risultato più di chi la compie. by introduce l'agente.",
  t:"Il \"si\" impersonale italiano spesso si rende col passivo: \"si parla\" = is spoken.",
  s:[
  ["The bridge was built in 1960.","Il ponte fu costruito nel 1960.","Past simple passivo."],
  ["English is spoken all over the world.","L'inglese si parla in tutto il mondo.","\"Si\" impersonale = passivo."],
  ["The results will be published next week.","I risultati saranno pubblicati la settimana prossima.","Futuro passivo."],
  ["My car is being repaired at the moment.","La mia macchina è in riparazione in questo momento.","Continuous passivo: is being + participio."],
  ["The project has been approved by the board.","Il progetto è stato approvato dal consiglio.","by = da (agente)."],
  ["Where were you born?","Dove sei nato?","born è sempre al passivo."]
]},
{ id:"b1-12", level:"B1", title:"used to, be used to, get used to", yt:"used to be used to get used to",
  f:"used to + base; be used to + -ing/nome; get used to + -ing/nome.",
  u:"used to = abitudine passata finita; be used to = essere abituato; get used to = abituarsi.",
  t:"Dopo be/get used to serve -ing: \"I'm used to working\", non \"to work\".",
  s:[
  ["I used to smoke, but I quit years ago.","Fumavo, ma ho smesso anni fa.","Abitudine finita = imperfetto italiano."],
  ["Did you use to play football as a child?","Giocavi a calcio da bambino?","In domande e negazioni: use senza -d."],
  ["I'm used to working late.","Sono abituato a lavorare fino a tardi.","be used to + -ing."],
  ["It took me months to get used to driving on the left.","Mi ci sono voluti mesi per abituarmi a guidare a sinistra.","get used to = processo di abituarsi."],
  ["There used to be a cinema on this street.","Una volta c'era un cinema in questa via.","There used to be = una volta c'era."],
  ["She'll soon get used to the new software.","Si abituerà presto al nuovo software.","get used to + nome."]
]},
{ id:"b1-13", level:"B1", title:"Gerundio o infinito", yt:"gerund or infinitive verbs",
  f:"verbo + -ing (enjoy, avoid, mind, finish) / verbo + to (decide, want, hope, manage).",
  u:"La scelta dipende dal verbo che precede. Dopo una preposizione sempre -ing.",
  t:"\"look forward to\": to è preposizione → looking forward to hearing.",
  s:[
  ["I enjoy working with international teams.","Mi piace lavorare con team internazionali.","enjoy + -ing."],
  ["We decided to postpone the launch.","Abbiamo deciso di rinviare il lancio.","decide + to."],
  ["Would you mind closing the window?","Ti dispiacerebbe chiudere la finestra?","mind + -ing: richiesta cortese."],
  ["I'm looking forward to hearing from you.","Attendo tue notizie.","Chiusura email standard."],
  ["She managed to finish everything on time.","È riuscita a finire tutto in tempo.","manage to = riuscire a."],
  ["Thanks for helping me.","Grazie per avermi aiutato.","Preposizione + -ing."]
]},
{ id:"b1-14", level:"B1", title:"Relative restrittive: who, that, which, whose, where", yt:"defining relative clauses",
  f:"who (persone), which/that (cose), whose (possesso), where (luogo).",
  u:"Identificano di chi o di cosa si parla. Se il pronome è oggetto si può omettere.",
  t:"\"tutto ciò che\" = everything (that), mai \"everything what\". La preposizione nel parlato va in fondo.",
  s:[
  ["The engineer who designed this is Italian.","L'ingegnere che ha progettato questo è italiano.","who per persone."],
  ["This is the software that we use for inspections.","Questo è il software che usiamo per le ispezioni.","that per cose (omettibile: the software we use)."],
  ["The man I spoke to was very helpful.","L'uomo con cui ho parlato è stato molto disponibile.","Pronome omesso, preposizione in fondo."],
  ["Do you know anyone whose car is electric?","Conosci qualcuno che abbia la macchina elettrica?","whose = il cui."],
  ["That's the place where we first met.","Quello è il posto dove ci siamo conosciuti.","where per luoghi."],
  ["Everything she said was true.","Tutto ciò che ha detto era vero.","everything (that)."]
]},
{ id:"b1-15", level:"B1", title:"Phrasal verbs essenziali", yt:"common phrasal verbs everyday english",
  f:"verbo + particella: find out, pick up, give up, run out of, turn down, look into.",
  u:"Il parlato nativo li preferisce ai verbi latini (find out invece di discover).",
  t:"Con un pronome l'oggetto va in mezzo: turn it down, non \"turn down it\".",
  s:[
  ["Can you find out what time the meeting starts?","Puoi scoprire a che ora inizia la riunione?","find out = scoprire, informarsi."],
  ["I'll pick you up at the station.","Ti vengo a prendere alla stazione.","pick up = andare a prendere."],
  ["Don't give up — you're almost there.","Non mollare: ci sei quasi.","give up = arrendersi, smettere."],
  ["We've run out of coffee.","Abbiamo finito il caffè.","run out of = rimanere senza."],
  ["Could you turn the volume down a bit?","Potresti abbassare un po' il volume?","turn down = abbassare (anche: rifiutare)."],
  ["I need to look into this problem before I answer.","Devo approfondire questo problema prima di rispondere.","look into = indagare, verificare."]
]},

/* ============================ B2 ============================ */
{ id:"b2-01", level:"B2", title:"Past perfect simple e continuous", yt:"past perfect simple and continuous",
  f:"had + participio; had been + -ing.",
  u:"Azione anteriore a un'altra già passata (il \"trapassato\"). Il continuous ne sottolinea la durata.",
  t:"Si usa solo se serve chiarire l'ordine: con after/before spesso basta il past simple.",
  s:[
  ["When I got to the station, the train had already left.","Quando sono arrivato alla stazione, il treno era già partito.","had left = era partito (prima del mio arrivo)."],
  ["I had never seen such a big crowd before.","Non avevo mai visto una folla così grande prima.","Esperienza fino a un punto del passato."],
  ["By the time the police arrived, the thieves had escaped.","Quando è arrivata la polizia, i ladri erano già scappati.","by the time = nel momento in cui, entro."],
  ["We had been driving for hours when we finally found a hotel.","Guidavamo da ore quando finalmente abbiamo trovato un albergo.","Durata prima di un momento passato."],
  ["After he had checked the data, he sent the report.","Dopo aver controllato i dati, ha inviato il report.","Sequenza esplicita."],
  ["His eyes were red because he had been crying.","Aveva gli occhi rossi perché aveva pianto.","Effetto visibile di un'attività precedente."]
]},
{ id:"b2-02", level:"B2", title:"Future continuous e future perfect", yt:"future continuous future perfect",
  f:"will be + -ing; will have + participio; will have been + -ing.",
  u:"Continuous = azione in corso in un momento futuro. Perfect = azione completata entro un momento futuro.",
  t:"\"entro\" = by: by Friday, by the end of the year.",
  s:[
  ["This time tomorrow I'll be flying to New York.","Domani a quest'ora sarò in volo per New York.","In corso in un momento futuro."],
  ["By the end of the year, we'll have completed the first phase.","Entro la fine dell'anno avremo completato la prima fase.","by + future perfect = entro."],
  ["Will you be using the car tonight?","Ti serve la macchina stasera?","Domanda cortese sui piani altrui."],
  ["By June, I'll have been working here for ten years.","A giugno saranno dieci anni che lavoro qui.","Durata fino a un punto futuro."],
  ["Don't call at nine; we'll be having dinner.","Non chiamare alle nove: staremo cenando.","Previsione di un'azione in corso."],
  ["They won't have finished the tests by Monday.","Per lunedì non avranno finito i test.","Negativo del future perfect."]
]},
{ id:"b2-03", level:"B2", title:"Third conditional", yt:"third conditional",
  f:"if + past perfect, would have + participio.",
  u:"Ipotesi sul passato che non si è verificata, con il rimpianto o la conseguenza immaginata.",
  t:"Nel parlato: \"If I'd known, I'd have told you\". 'd = had nella prima parte, would nella seconda.",
  s:[
  ["If I had known, I would have told you.","Se l'avessi saputo, te l'avrei detto.","Forma base del third conditional."],
  ["If we had left earlier, we wouldn't have missed the flight.","Se fossimo partiti prima, non avremmo perso il volo.","Negativo nella conseguenza."],
  ["She would have got the job if she had prepared better.","Avrebbe ottenuto il lavoro se si fosse preparata meglio.","L'ordine delle frasi si può invertire."],
  ["What would you have done if they had said no?","Cosa avresti fatto se avessero detto di no?","Domanda."],
  ["If it hadn't been for your help, I would have failed.","Se non fosse stato per il tuo aiuto, avrei fallito.","Formula fissa: if it hadn't been for."],
  ["We could have won if we had played as a team.","Avremmo potuto vincere se avessimo giocato di squadra.","could have = avremmo potuto."]
]},
{ id:"b2-04", level:"B2", title:"Mixed conditionals", yt:"mixed conditionals",
  f:"if + past perfect, would + base / if + past simple, would have + participio.",
  u:"Collegano un'ipotesi passata a una conseguenza presente, o una caratteristica presente a una conseguenza passata.",
  t:"Pensa ai due tempi separatamente: quando avviene la condizione? quando la conseguenza?",
  s:[
  ["If I had taken that job, I would be living in London now.","Se avessi accettato quel lavoro, ora vivrei a Londra.","Passato → presente."],
  ["If she weren't so stubborn, she would have accepted our help.","Se non fosse così testarda, avrebbe accettato il nostro aiuto.","Presente → passato."],
  ["If we had invested in that technology, we'd be market leaders today.","Se avessimo investito in quella tecnologia, oggi saremmo leader di mercato.","Rimpianto strategico."],
  ["I wouldn't be so tired if I had gone to bed earlier.","Non sarei così stanco se fossi andato a letto prima.","Effetto presente di una scelta passata."],
  ["If I spoke Chinese, I would have negotiated the deal myself.","Se parlassi cinese, avrei negoziato l'accordo io stesso.","Abilità presente → fatto passato."],
  ["If you hadn't reminded me, I'd still be waiting.","Se non me l'avessi ricordato, starei ancora aspettando.","would be + -ing per il presente."]
]},
{ id:"b2-05", level:"B2", title:"wish e if only", yt:"wish if only grammar",
  f:"wish + past (presente); wish + past perfect (passato); wish + would (comportamento altrui).",
  u:"Desideri irrealizzabili, rimpianti, irritazione per abitudini altrui.",
  t:"\"Vorrei avere\" = I wish I had, non \"I would like to have\" quando è un desiderio irreale.",
  s:[
  ["I wish I had more free time.","Vorrei avere più tempo libero.","wish + past = desiderio sul presente."],
  ["I wish I hadn't said that.","Vorrei non averlo detto.","wish + past perfect = rimpianto."],
  ["If only I had listened to you!","Se solo ti avessi ascoltato!","Più enfatico di wish."],
  ["I wish you would stop interrupting me.","Vorrei che smettessi di interrompermi.","wish + would = fastidio."],
  ["She wishes she could speak English fluently.","Vorrebbe saper parlare inglese fluentemente.","wish + could = abilità desiderata."],
  ["If only it would stop raining.","Se solo smettesse di piovere.","Desiderio di cambiamento esterno."]
]},
{ id:"b2-06", level:"B2", title:"Discorso indiretto: affermazioni", yt:"reported speech statements",
  f:"say (that) / tell + persona (that) + backshift: am → was, will → would, have done → had done.",
  u:"Riferire ciò che qualcuno ha detto. Con il verbo introduttivo al presente non si sposta il tempo.",
  t:"tell vuole la persona (told me), say no (said that). \"Ha detto che sarebbe venuto\" = he said he would come.",
  s:[
  ["She said she was tired.","Ha detto che era stanca.","am → was."],
  ["He told me he had already sent the invoice.","Mi ha detto che aveva già inviato la fattura.","has sent → had sent; tell + me."],
  ["They said they would call back the next day.","Hanno detto che avrebbero richiamato il giorno dopo.","will → would; tomorrow → the next day."],
  ["The manager explained that the budget had been cut.","Il responsabile ha spiegato che il budget era stato tagliato.","Verbo introduttivo più preciso di say."],
  ["She mentioned that she was leaving the company.","Ha accennato al fatto che stava lasciando l'azienda.","mention = accennare."],
  ["He says he's going to be late.","Dice che farà tardi.","Introduttivo al presente: nessun backshift."]
]},
{ id:"b2-07", level:"B2", title:"Domande indirette e ordini riferiti", yt:"reported questions and commands",
  f:"ask + if/whether / wh- + ordine affermativo; tell/ask + persona + (not) to.",
  u:"Riferire domande e richieste; fare domande cortesi (Could you tell me...?).",
  t:"Nessun do/did e niente inversione: \"where I lived\", non \"where did I live\".",
  s:[
  ["She asked me where I lived.","Mi ha chiesto dove abitavo.","Ordine soggetto-verbo."],
  ["He asked if I could help him.","Mi ha chiesto se potevo aiutarlo.","if/whether per le domande sì/no."],
  ["They wanted to know when the project would start.","Volevano sapere quando sarebbe iniziato il progetto.","will → would."],
  ["The doctor told me to rest for a few days.","Il medico mi ha detto di riposare per qualche giorno.","tell + persona + to."],
  ["She asked us not to make any noise.","Ci ha chiesto di non fare rumore.","not to per l'ordine negativo."],
  ["Could you tell me where the station is?","Mi sa dire dov'è la stazione?","Domanda indiretta cortese: is in fondo."]
]},
{ id:"b2-08", level:"B2", title:"Passivo avanzato: have something done, it is said", yt:"have something done causative passive",
  f:"have/get + oggetto + participio; It is said that... / He is believed to...",
  u:"Far fare qualcosa a qualcun altro; riportare opinioni in modo impersonale (stile giornalistico).",
  t:"\"Mi faccio tagliare i capelli\" = I have my hair cut, non \"I cut my hair\".",
  s:[
  ["I'm having my car serviced tomorrow.","Domani faccio fare il tagliando alla macchina.","have something done = far fare."],
  ["We need to get the documents translated.","Dobbiamo far tradurre i documenti.","get = have, più colloquiale."],
  ["It is said that the company will be sold.","Si dice che l'azienda sarà venduta.","It is said that = si dice che."],
  ["He is believed to be the richest man in the city.","Si ritiene che sia l'uomo più ricco della città.","be believed to + base."],
  ["The new rules are expected to come into force next year.","Si prevede che le nuove norme entrino in vigore l'anno prossimo.","come into force = entrare in vigore."],
  ["She had her bag stolen on the train.","Le hanno rubato la borsa sul treno.","have something done anche per eventi subiti."]
]},
{ id:"b2-09", level:"B2", title:"Deduzione al passato: must have, can't have, might have", yt:"must have might have can't have",
  f:"must / might / may / could / can't / couldn't + have + participio.",
  u:"Supposizioni su fatti passati, dal quasi certo all'impossibile.",
  t:"Il futuro anteriore italiano di supposizione (\"si sarà dimenticato\") = must have forgotten.",
  s:[
  ["He must have forgotten about the meeting.","Si sarà dimenticato della riunione.","Quasi certo."],
  ["She can't have finished already — she only started an hour ago.","Non può aver già finito: ha iniziato solo un'ora fa.","Impossibile."],
  ["They might have taken the wrong road.","Potrebbero aver preso la strada sbagliata.","Possibile."],
  ["You must have been really worried.","Sarai stato davvero preoccupato.","Deduzione empatica."],
  ["The email may have gone into spam.","L'email potrebbe essere finita nello spam.","may have = forse."],
  ["He couldn't have known about it.","Non poteva saperlo.","couldn't have = can't have."]
]},
{ id:"b2-10", level:"B2", title:"should have, could have, needn't have", yt:"should have could have needn't have",
  f:"should / shouldn't / could / might / needn't + have + participio.",
  u:"Rimpianti, critiche, possibilità non sfruttate, azioni fatte inutilmente.",
  t:"needn't have done = l'hai fatto ma non serviva; didn't need to = non serviva (di solito non l'hai fatto).",
  s:[
  ["You should have told me earlier.","Avresti dovuto dirmelo prima.","Critica o rimpianto."],
  ["I shouldn't have eaten so much.","Non avrei dovuto mangiare così tanto.","Autocritica."],
  ["We could have taken a taxi, but we walked.","Avremmo potuto prendere un taxi, ma siamo andati a piedi.","Possibilità non sfruttata."],
  ["You needn't have brought anything, but thank you!","Non c'era bisogno che portassi niente, ma grazie!","Fatto ma non necessario."],
  ["We didn't need to wait — the doors were already open.","Non abbiamo dovuto aspettare: le porte erano già aperte.","Non necessario e non fatto."],
  ["You might have warned me!","Avresti potuto avvisarmi!","might have = rimprovero."]
]},
{ id:"b2-11", level:"B2", title:"Relative non restrittive e \"which\" di frase", yt:"non-defining relative clauses",
  f:", who ... , / , which ... , / , whose ... , / most of whom, some of which.",
  u:"Aggiungono un'informazione accessoria tra virgole. which può riferirsi a tutta la frase (= il che).",
  t:"Mai that nelle relative tra virgole, e il pronome non si omette.",
  s:[
  ["My brother, who lives in Berlin, is visiting next week.","Mio fratello, che vive a Berlino, viene a trovarci la settimana prossima.","Informazione accessoria."],
  ["The project, which started in 2020, is nearly finished.","Il progetto, iniziato nel 2020, è quasi finito.","which tra virgole."],
  ["He didn't call me back, which was quite annoying.","Non mi ha richiamato, il che è stato piuttosto fastidioso.","which = il che."],
  ["Our CEO, whose vision shaped the company, is retiring.","Il nostro CEO, la cui visione ha dato forma all'azienda, va in pensione.","whose = la cui."],
  ["We stayed at the Grand Hotel, where we had stayed the year before.","Abbiamo alloggiato al Grand Hotel, dove eravamo stati l'anno prima.","where tra virgole."],
  ["I spoke to several suppliers, most of whom were very helpful.","Ho parlato con diversi fornitori, la maggior parte dei quali è stata molto disponibile.","most of whom = la maggior parte dei quali."]
]},
{ id:"b2-12", level:"B2", title:"Connettivi di contrasto", yt:"although despite however whereas",
  f:"although / even though + frase; despite / in spite of + nome o -ing; however (nuova frase); whereas.",
  u:"Esprimere concessione e contrasto con il registro adatto.",
  t:"despite senza of: \"despite the delay\", non \"despite of\".",
  s:[
  ["Although it was raining, we went for a walk.","Anche se pioveva, siamo andati a fare una passeggiata.","although + frase."],
  ["Despite the delay, the project was a success.","Nonostante il ritardo, il progetto è stato un successo.","despite + nome."],
  ["In spite of feeling ill, she went to work.","Pur sentendosi male, è andata al lavoro.","in spite of + -ing."],
  ["The plan is good. However, it's too expensive.","Il piano è valido. Tuttavia, è troppo costoso.","However apre una nuova frase."],
  ["I prefer working early, whereas my colleague prefers working late.","Io preferisco lavorare presto, mentre il mio collega preferisce lavorare tardi.","whereas = mentre (contrasto)."],
  ["Even though he's very experienced, he made a basic mistake.","Nonostante sia molto esperto, ha fatto un errore banale.","even though = più forte di although."]
]},
{ id:"b2-13", level:"B2", title:"Phrasal verbs per lavoro e relazioni", yt:"business phrasal verbs",
  f:"come up with, put off, get on with, deal with, call off, put up with.",
  u:"Alta frequenza in riunioni, email e conversazioni.",
  t:"Alcuni hanno tre parti e non si separano: put up with it, come up with an idea.",
  s:[
  ["We need to come up with a better solution.","Dobbiamo trovare una soluzione migliore.","come up with = ideare."],
  ["The meeting has been put off until next week.","La riunione è stata rinviata alla settimana prossima.","put off = rinviare."],
  ["I get on really well with my colleagues.","Vado molto d'accordo con i miei colleghi.","get on with = andare d'accordo."],
  ["Can you deal with this complaint?","Puoi occuparti di questo reclamo?","deal with = gestire."],
  ["They called off the strike at the last minute.","Hanno revocato lo sciopero all'ultimo minuto.","call off = annullare."],
  ["We can't put up with these delays any longer.","Non possiamo più sopportare questi ritardi.","put up with = tollerare."]
]},
{ id:"b2-14", level:"B2", title:"Verbi che cambiano significato: stop, remember, try, regret", yt:"stop remember try regret gerund infinitive",
  f:"verbo + -ing vs verbo + to, con significato diverso.",
  u:"stop -ing = smettere / stop to = fermarsi per; remember to = ricordarsi di (dopo) / remember -ing = ricordare (prima); try -ing = provare a vedere / try to = sforzarsi.",
  t:"\"Ricordati di chiamare\" = remember to call; \"ricordo di averlo chiamato\" = I remember calling him.",
  s:[
  ["I stopped smoking two years ago.","Ho smesso di fumare due anni fa.","stop -ing = smettere."],
  ["On the way home, I stopped to buy some bread.","Tornando a casa, mi sono fermato a comprare il pane.","stop to = fermarsi per."],
  ["Remember to lock the door.","Ricordati di chiudere la porta a chiave.","remember to = azione futura."],
  ["I remember meeting him at a conference.","Ricordo di averlo conosciuto a una conferenza.","remember -ing = ricordo del passato."],
  ["Try restarting the computer.","Prova a riavviare il computer.","try -ing = fare un tentativo per vedere se funziona."],
  ["We regret to inform you that your application has been unsuccessful.","Siamo spiacenti di informarla che la sua candidatura non è stata accolta.","regret to = annuncio formale negativo."]
]},

/* ============================ C1 ============================ */
{ id:"c1-01", level:"C1", title:"Inversione dopo espressioni negative", yt:"negative inversion english",
  f:"Never / Rarely / Not only / Hardly ... when / No sooner ... than / Under no circumstances / Only then + ausiliare + soggetto.",
  u:"Enfasi e registro formale, tipico di discorsi, presentazioni e scrittura.",
  t:"Serve l'ausiliare come in una domanda: \"Not only did they finish\", non \"Not only they finished\".",
  s:[
  ["Never have I seen such a well-organised event.","Non ho mai visto un evento così ben organizzato.","Never + have + I."],
  ["Not only did they finish early, but they also came in under budget.","Non solo hanno finito in anticipo, ma sono anche rimasti sotto budget.","Not only + did."],
  ["Hardly had we sat down when the fire alarm went off.","Ci eravamo appena seduti quando è scattato l'allarme antincendio.","Hardly ... when."],
  ["No sooner had we launched the product than orders started pouring in.","Avevamo appena lanciato il prodotto che gli ordini hanno iniziato ad arrivare a valanga.","No sooner ... than."],
  ["Under no circumstances should you share your password.","In nessun caso dovete condividere la password.","Divieto enfatico."],
  ["Only then did I realise how serious the situation was.","Solo allora mi sono reso conto di quanto fosse grave la situazione.","Only then + did."]
]},
{ id:"c1-02", level:"C1", title:"Frasi scisse (cleft sentences)", yt:"cleft sentences english",
  f:"What I need is... / It was X who... / All I want is... / The reason (why)... is that...",
  u:"Mettere a fuoco l'elemento importante, come l'italiano \"è stato Marco a...\".",
  t:"\"The reason is that\", non \"the reason is because\" (accettato nel parlato, evitato nel registro curato).",
  s:[
  ["What I need is a bit more time.","Quello di cui ho bisogno è un po' più di tempo.","What + frase + is."],
  ["It was Marco who found the error, not me.","È stato Marco a trovare l'errore, non io.","It was X who = è stato X a."],
  ["What really annoys me is the lack of communication.","Ciò che mi dà davvero fastidio è la mancanza di comunicazione.","Enfasi sull'oggetto della critica."],
  ["It's not the price that worries me, it's the timing.","Non è il prezzo a preoccuparmi, sono i tempi.","Contrasto con It's not ... it's."],
  ["All I want is a straight answer.","Voglio solo una risposta chiara.","All I want = tutto ciò che voglio."],
  ["The reason why we're late is that the road was closed.","Il motivo per cui siamo in ritardo è che la strada era chiusa.","the reason ... is that."]
]},
{ id:"c1-03", level:"C1", title:"Condizionali con inversione", yt:"inverted conditionals had should were",
  f:"Had I known = If I had known; Should you need = If you should need; Were it not for = If it weren't for.",
  u:"Registro formale: email professionali, contratti, presentazioni.",
  t:"Nella forma negativa non si contrae: \"Had it not been\", non \"Hadn't it been\".",
  s:[
  ["Had I known about the problem, I would have acted sooner.","Se avessi saputo del problema, avrei agito prima.","Had I = If I had."],
  ["Should you have any questions, please do not hesitate to contact me.","Qualora avesse domande, non esiti a contattarmi.","Chiusura classica di email formale."],
  ["Were it not for her support, the project would fail.","Se non fosse per il suo sostegno, il progetto fallirebbe.","Were it not for = se non fosse per."],
  ["Had it not been for the rain, the match would have finished on time.","Se non fosse stato per la pioggia, la partita sarebbe finita in orario.","Negativo non contratto."],
  ["Were we to accept this offer, we would need more staff.","Se dovessimo accettare questa offerta, ci servirebbe più personale.","Were we to = se dovessimo."],
  ["Should the situation change, we will inform you immediately.","Qualora la situazione cambiasse, la informeremo immediatamente.","Should + soggetto = qualora."]
]},
{ id:"c1-04", level:"C1", title:"Congiuntivo e strutture formali", yt:"subjunctive english suggest that",
  f:"suggest / recommend / insist / demand / it is essential that + soggetto + forma base.",
  u:"Raccomandazioni e richieste formali (molto comune nell'inglese americano e nei documenti ufficiali).",
  t:"Nessuna -s alla terza persona: \"that he contact\", \"that the deadline be respected\". Alternativa britannica: should + base.",
  s:[
  ["I suggest that he contact the supplier directly.","Suggerisco che contatti direttamente il fornitore.","contact senza -s."],
  ["It is essential that every worker wear protective equipment.","È fondamentale che ogni lavoratore indossi i dispositivi di protezione.","wear senza -s."],
  ["The client insisted that the deadline be respected.","Il cliente ha preteso che la scadenza fosse rispettata.","be + participio."],
  ["We recommend that the contract be reviewed by a lawyer.","Raccomandiamo che il contratto sia esaminato da un avvocato.","Registro legale."],
  ["If I were in your position, I would think twice.","Se fossi nella tua posizione, ci penserei due volte.","were per tutte le persone."],
  ["The board demanded that the report be submitted by Friday.","Il consiglio ha preteso che il rapporto fosse presentato entro venerdì.","demand that + base."]
]},
{ id:"c1-05", level:"C1", title:"It's time, would rather, suppose + past", yt:"it's time would rather unreal past",
  f:"It's (high) time + soggetto + past; would rather + soggetto + past / past perfect; would rather + base.",
  u:"Past irreale: forma passata, significato presente o futuro. Esprime urgenza o preferenza.",
  t:"Con lo stesso soggetto si usa la base (I'd rather stay); con soggetto diverso il past (I'd rather you stayed).",
  s:[
  ["It's time we made a decision.","È ora che prendiamo una decisione.","made = past irreale."],
  ["It's high time you started taking this seriously.","Sarebbe ora che cominciassi a prenderla sul serio.","high time = urgenza o critica."],
  ["I'd rather you didn't tell anyone.","Preferirei che non lo dicessi a nessuno.","Soggetto diverso → past."],
  ["I'd rather stay at home tonight.","Stasera preferirei restare a casa.","Stesso soggetto → base."],
  ["I'd rather you had asked me first.","Avrei preferito che me lo chiedessi prima.","Rimpianto → past perfect."],
  ["Suppose you lost all your data — what would you do?","Supponi di perdere tutti i dati: cosa faresti?","suppose + past = ipotesi."]
]},
{ id:"c1-06", level:"C1", title:"Frasi participiali", yt:"participle clauses english",
  f:"-ing / having + participio / participio passato all'inizio o dopo un nome.",
  u:"Rendere il discorso più compatto ed elegante.",
  t:"Il soggetto implicito deve coincidere con quello della frase principale, altrimenti la frase diventa ambigua.",
  s:[
  ["Having finished the report, she went home.","Finito il report, è andata a casa.","Having + participio = dopo aver."],
  ["Built in the 1960s, the bridge now needs major repairs.","Costruito negli anni Sessanta, il ponte ora necessita di importanti riparazioni.","Participio passato con valore passivo."],
  ["Not knowing what to say, I stayed silent.","Non sapendo cosa dire, sono rimasto in silenzio.","Not + -ing = causa."],
  ["The man sitting next to me was a famous architect.","L'uomo seduto accanto a me era un architetto famoso.","sitting = who was sitting."],
  ["Given the circumstances, I think we did well.","Date le circostanze, credo che ce la siamo cavata bene.","Given = considerato."],
  ["Having been warned about the traffic, we left early.","Essendo stati avvisati del traffico, siamo partiti presto.","Participiale passivo."]
]},
{ id:"c1-07", level:"C1", title:"Modalità avanzata: be bound to, be supposed to, be to, be due to", yt:"be bound to be supposed to be likely to",
  f:"be bound to / be likely to / be supposed to / be to / be due to + base.",
  u:"Certezza, probabilità, aspettative, programmi ufficiali e scadenze.",
  t:"was supposed to = \"dovevo\" (ma non è successo). È il modo naturale di esprimere un piano saltato.",
  s:[
  ["Prices are bound to rise after the new regulations.","I prezzi aumenteranno di sicuro dopo le nuove norme.","be bound to = è certo che."],
  ["We were supposed to meet at nine, but he never showed up.","Dovevamo vederci alle nove, ma non si è mai presentato.","Piano non realizzato."],
  ["The minister is to visit the site next month.","Il ministro visiterà il cantiere il mese prossimo.","be to = programma ufficiale (stile giornalistico)."],
  ["You're not supposed to park here.","Qui non si dovrebbe parcheggiare.","Regola, aspettativa."],
  ["She's likely to be promoted this year.","È probabile che quest'anno venga promossa.","be likely to = probabilmente."],
  ["We're due to deliver the prototype in March.","Dobbiamo consegnare il prototipo a marzo.","be due to = scadenza prevista."]
]},
{ id:"c1-08", level:"C1", title:"Hedging: attenuare e prendere le distanze", yt:"hedging language english",
  f:"It would appear that / tends to / arguably / There seems to be / To a certain extent / I'm not entirely convinced.",
  u:"Esprimere disaccordo o incertezza in modo diplomatico: essenziale in negoziazione e nella scrittura professionale.",
  t:"Un inglese troppo diretto suona aggressivo. Le formule attenuate non sono debolezza, sono registro.",
  s:[
  ["It would appear that the figures are incorrect.","Sembrerebbe che i numeri siano errati.","Critica attenuata."],
  ["This approach tends to work better in larger teams.","Questo approccio tende a funzionare meglio nei team più grandi.","tends to = generalizzazione prudente."],
  ["Arguably, this is the most important decision of the year.","Probabilmente questa è la decisione più importante dell'anno.","arguably = si può sostenere che."],
  ["There seems to be a misunderstanding.","Sembra che ci sia un malinteso.","Segnalare un problema senza accusare."],
  ["To a certain extent, I agree with you.","Fino a un certo punto, sono d'accordo con te.","Accordo parziale."],
  ["I'm not entirely convinced that this is the right moment.","Non sono del tutto convinto che sia il momento giusto.","Disaccordo diplomatico."]
]},
{ id:"c1-09", level:"C1", title:"Collocazioni professionali", yt:"business english collocations meetings",
  f:"reach a consensus, run through, meet requirements, raise an issue, strike a balance, take the lead.",
  u:"Combinazioni fisse che un madrelingua usa automaticamente: sbagliarle tradisce il calco dall'italiano.",
  t:"\"raggiungere un accordo\" = reach an agreement, non \"arrive at an agreement\"; \"sollevare una questione\" = raise an issue.",
  s:[
  ["We need to reach a consensus before the deadline.","Dobbiamo raggiungere un consenso prima della scadenza.","reach a consensus / an agreement."],
  ["Let's run through the main points again.","Ripassiamo di nuovo i punti principali.","run through = passare in rassegna."],
  ["The proposal didn't meet our requirements.","La proposta non soddisfaceva i nostri requisiti.","meet requirements / expectations / a deadline."],
  ["They're going to raise the issue at the next board meeting.","Solleveranno la questione alla prossima riunione del consiglio.","raise an issue / a concern."],
  ["We have to strike a balance between cost and quality.","Dobbiamo trovare un equilibrio tra costo e qualità.","strike a balance."],
  ["Could you take the lead on this project?","Potresti prendere la guida di questo progetto?","take the lead = assumere la guida."]
]},
{ id:"c1-10", level:"C1", title:"Espressioni idiomatiche ad alta frequenza", yt:"common english idioms",
  f:"Espressioni fisse, non traducibili parola per parola.",
  u:"Danno naturalezza al parlato; vanno usate con misura e nel registro giusto.",
  t:"Non tradurre gli idiomi italiani letteralmente: \"in bocca al lupo\" = good luck / break a leg.",
  s:[
  ["Let's not beat around the bush: the deal is off.","Non giriamoci intorno: l'accordo salta.","beat around (UK: about) the bush = girarci intorno."],
  ["We're all in the same boat.","Siamo tutti sulla stessa barca.","Corrispondenza diretta con l'italiano."],
  ["That was a close call.","C'è mancato poco.","close call = scampato pericolo."],
  ["I'll keep you in the loop.","Ti terrò aggiornato.","in the loop = informato."],
  ["It's not rocket science.","Non è mica difficile.","Ironico: non serve un genio."],
  ["Let's call it a day.","Per oggi basta così.","Chiudere la giornata di lavoro."]
]},
{ id:"c1-11", level:"C1", title:"Enfasi: do/did, the more... the more, whatever", yt:"emphasis english grammar do did",
  f:"do/does/did + base enfatico; the + comparativo, the + comparativo; whatever / whoever / however.",
  u:"Rafforzare un'affermazione, esprimere proporzionalità, generalizzare.",
  t:"\"Più ci penso, meno mi piace\" = The more I think about it, the less I like it (con the in entrambe le parti).",
  s:[
  ["I do understand your concerns.","Capisco davvero le tue preoccupazioni.","do enfatico: accento su do."],
  ["She did warn us, but we didn't listen.","Ci aveva avvisati eccome, ma non abbiamo ascoltato.","did enfatico al passato."],
  ["The sooner we start, the sooner we'll finish.","Prima iniziamo, prima finiamo.","Proporzionalità."],
  ["The more I think about it, the less I like it.","Più ci penso, meno mi piace.","the more ... the less."],
  ["It's by far the best offer we've received.","È di gran lunga la migliore offerta che abbiamo ricevuto.","by far rafforza il superlativo."],
  ["Whatever happens, don't panic.","Qualunque cosa succeda, niente panico.","whatever = qualunque cosa."]
]},
{ id:"c1-12", level:"C1", title:"Marcatori del discorso nella conversazione", yt:"discourse markers spoken english",
  f:"mind you, as it happens, that said, come to think of it, to cut a long story short, as far as I'm concerned.",
  u:"Organizzano il parlato, introducono riserve, cambi di prospettiva, sintesi.",
  t:"Sono il segnale più evidente di fluidità C1: usane due o tre con naturalezza invece di \"so\" e \"but\" ripetuti.",
  s:[
  ["It's expensive. Mind you, it's very well made.","È caro. Però, bisogna dire che è fatto molto bene.","mind you = però, va detto."],
  ["As it happens, I know the director personally.","Guarda caso, conosco personalmente il direttore.","as it happens = guarda caso."],
  ["That said, I think we should give it a try.","Detto questo, credo che dovremmo provarci.","that said = detto ciò."],
  ["Come to think of it, he did seem a bit nervous.","A pensarci bene, sembrava un po' nervoso.","come to think of it = a pensarci."],
  ["Anyway, to cut a long story short, we got the contract.","Comunque, per farla breve, abbiamo ottenuto il contratto.","to cut a long story short = per farla breve."],
  ["As far as I'm concerned, the matter is closed.","Per quanto mi riguarda, la questione è chiusa.","as far as I'm concerned = per quanto mi riguarda."]
]}
];

/* Fonti verificate: audio ufficiale, trascrizione, licenza aperta (Creative Commons). */
const SOURCES = [
  { name:"TED — Technology", url:"https://www.ted.com/topics/technology", note:"Licenza CC BY-NC-ND 4.0, trascrizione umana con tempi e traduzione italiana ufficiale. È la fonte del percorso." },
  { name:"TED — Artificial intelligence", url:"https://www.ted.com/topics/ai", note:"Talk su intelligenza artificiale: Fei-Fei Li, Hassabis, Altman, Brockman, Sal Khan." },
  { name:"TED — Robots", url:"https://www.ted.com/topics/robots", note:"Robotica: Marc Raibert (Boston Dynamics), Kate Darling, Daniela Rus." },
  { name:"Intelligent Machines (TWiT)", url:"https://twit.tv/shows/intelligent-machines", note:"Podcast settimanale sull'AI, licenza CC BY-NC-ND 4.0. Trascrizione generata da AI e minuti riferiti alla versione con pubblicità: solo ascolto libero." },
  { name:"Security Now (TWiT)", url:"https://twit.tv/shows/security-now", note:"Sicurezza informatica, CC BY-NC-ND 4.0; inglese americano tecnico e lento. Solo ascolto libero." }
];
