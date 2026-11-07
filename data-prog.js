/* Voci tech in ascolto progressivo: estratti continui di interviste (video YouTube ufficiali incorporati),
   divisi in pezzi giornalieri. Frasi verbatim dalla trascrizione ufficiale (verificate con tools/verify_prog.py).
   full: [inizio pezzo (s), testo (vuoto: la trascrizione integrale non è riprodotta), inizio, fine].
   Ogni frase: [inglese, italiano, contesto, { t: inizio nel video (s, dal minutaggio della trascrizione), tEnd, sound, build, reuse }]. */
"use strict";

LEVELS.PROG = "Interviste reali in ascolto progressivo: un estratto continuo diviso in pezzi giornalieri. Shadowing delle frasi del pezzo, poi ascolto cumulativo del video originale dall'inizio dell'estratto.";

const PROG_UNITS = [
{ id:"vp-01", level:"PROG", track:"prog", title:"Sam Altman · ChatGPT, GPT-4 e la memoria dei modelli",
  src:{ name:"Lex Fridman Podcast #419 (estratto 46:05–52:23)", date:"18 marzo 2024", tx:"https://lexfridman.com/sam-altman-2-transcript/", yt:"jvqFAi7vkBc" },
  yt:"Sam Altman Lex Fridman",
  f:"Conversazione vera, non un discorso preparato: Altman parla veloce, si corregge a metà frase, usa “I mean”, “sort of”, “whatever”. Lex Fridman interviene con domande lente e lunghe.",
  u:"Seguire il filo malgrado le ripartenze. Riconoscere le riduzioni (gonna, kinda) e il lessico AI: post-training, context window, base model.",
  t:"",
  full:[[2765,"",2765,2844],[2844,"",2844,2935],[2935,"",2935,3013],[3013,"",3013,3143]],
  s:[
  ["There’s a glimmer of something amazing in there. When people talk about it, what it does, they’re like, “Oh, it helps me code more productively. It helps me write more faster and better.","C'è un barlume di qualcosa di straordinario lì dentro. Quando la gente ne parla, di cosa fa, dicono tipo: “Oh, mi aiuta a programmare in modo più produttivo. Mi aiuta a scrivere più velocemente e meglio.”","Sull'uso di ChatGPT come partner creativo.",
    { t:2785, tEnd:2800, sound:"“they’re like” = dicono tipo: il like americano che introduce un discorso riportato. “write more faster” è un errore spontaneo.",
      build:"There’s a glimmer of X in there = c'è un barlume di X.", reuse:"There’s a glimmer of something important in this data." }],
  ["One of the other things that you can see a very small glimpse of is when I can help on longer horizon tasks, break down something in multiple steps, maybe execute some of those steps, search the internet, write code, whatever, put that together. When that works, which is not very often, it’s very magical.","Un'altra cosa di cui si vede un piccolissimo assaggio è quando può aiutare in compiti di più lungo respiro: scomporre qualcosa in più passaggi, magari eseguirne alcuni, cercare su internet, scrivere codice, quel che sia, e mettere tutto insieme. Quando funziona, e non succede spesso, è magico.","Sugli agenti AI, prima che esistessero davvero.",
    { t:2823, tEnd:2844, sound:"“I can help” qui significa “it can help”: nel parlato veloce “it” e “I” si confondono. “whatever” chiude un elenco.",
      build:"When that works, which is not very often, it’s X: relativa inserita tra virgole.", reuse:"When the model works, which is not very often yet, it’s very useful." }],
  ["Both, to break it down and then do things that different layers of abstraction to put them together. Look, I don’t want to downplay the accomplishment of GPT-4, but I don’t want to overstate it either.","Entrambe le cose: scomporlo e poi fare le cose a diversi livelli di astrazione per rimetterle insieme. Guarda, non voglio sminuire il risultato di GPT-4, ma nemmeno sopravvalutarlo.","Risponde alla domanda di Lex sui livelli di astrazione.",
    { t:2860, tEnd:2876, sound:"“I don’t want to” → “I dunno wanna”; “Look,” all'inizio segnala un'opinione netta.",
      build:"I don’t want to downplay X, but I don’t want to overstate it either.", reuse:"I don’t want to downplay our results, but I don’t want to overstate them either." }],
  ["And in that sense, I do think it’ll be a moment where a lot of the world went from not believing to believing. That was more about the ChatGPT interface.","E in questo senso credo davvero che sarà ricordato come il momento in cui gran parte del mondo è passata dal non crederci al crederci. Ed è stato più merito dell'interfaccia di ChatGPT.","Sul momento ChatGPT.",
    { t:2899, tEnd:2912, sound:"“I do think” con il do enfatico (unità C1-11); “it’ll” → “iddle”.",
      build:"went from not X-ing to X-ing = passare dal non… al…", reuse:"It was the moment our client went from not believing to believing in predictive maintenance." }],
  ["I mean they’re both super important, but the RLHF, the post-training step, the little wrapper of things that from a compute perspective, little wrapper of things that we do on top of the base model even though it’s a huge amount of work, that’s really important to say nothing of the product that we build around it.","Voglio dire, sono entrambi importantissimi, ma l'RLHF, la fase di post-addestramento, quel piccolo involucro di cose che, dal punto di vista del calcolo, quel piccolo involucro che mettiamo sopra il modello di base, anche se è un'enorme quantità di lavoro, è davvero importante, per non parlare del prodotto che ci costruiamo intorno.","Modello di base contro post-training: frase reale, con ripetizioni e correzioni.",
    { t:2935, tEnd:2958, sound:"Si ripete (“little wrapper of things… little wrapper of things”): aspetta la seconda versione. “to say nothing of” = per non parlare di.",
      build:"X is really important, to say nothing of Y.", reuse:"The sensors are really important, to say nothing of the software we build around them." }],
  ["And that. But that was a known difficult thing. We knew we were going to have to scale it up.","Anche quello. Ma era una difficoltà nota. Sapevamo che avremmo dovuto farlo crescere di scala.","Sulla sfida di far usare ChatGPT a milioni di persone insieme.",
    { t:2982, tEnd:2989, sound:"“we were going to have to” → “we were gonna hafta”: riduzione tipica.",
      build:"We knew we were going to have to X = sapevamo che avremmo dovuto X.", reuse:"We knew we were going to have to scale up the inspection team." }],
  ["Most people don’t need all the way to 128 most of the time. Although if we dream into the distant future, we’ll have way distant future, we’ll have context length of several billion.","La maggior parte delle persone, quasi sempre, non ha bisogno di arrivare fino a 128 [mila token]. Anche se, se sogniamo un futuro lontano, avremo, molto lontano, avremo finestre di contesto di diversi miliardi.","Sulla lunghezza del contesto dei modelli.",
    { t:3013, tEnd:3026, sound:"“all the way to” = fino a; “way distant future”: way rafforza (molto lontano).",
      build:"Most people don’t need X most of the time. Although if we dream into the distant future, …", reuse:"Most clients don’t need real-time data most of the time. Although in the distant future, they will." }],
  ["I saw this internet clip once, I’m going to get the numbers wrong, but it was like Bill Gates talking about the amount of memory on some early computer, maybe it was 64K, maybe 640K, something like that.","Una volta ho visto un video su internet, sbaglierò i numeri, ma era tipo Bill Gates che parlava della quantità di memoria di uno dei primi computer, forse 64K, forse 640K, qualcosa del genere.","Aneddoto per dire che la domanda di memoria cresce sempre.",
    { t:3066, tEnd:3080, sound:"“I’m going to get the numbers wrong” → “I’m gonna get the numbers wrong”: premessa tipica prima di citare a memoria.",
      build:"I’m going to get X wrong, but… = sbaglierò X, ma…", reuse:"I’m going to get the figures wrong, but it was something like twenty percent." }]
]}
];
UNITS.push(...PROG_UNITS);
