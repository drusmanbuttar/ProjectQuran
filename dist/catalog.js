// Editorial starter index. References are not exhaustive. No asserted BCE dates.
export const prophets = [
['adam','Adam','آدم','Adam',['2:30-39','7:11-27','20:115-123']],
['idris','Idris','إدريس','Enoch',['19:56-57','21:85-86']],
['nuh','Nuh','نوح','Noah',['11:25-49','71:1-28','29:14-15']],
['hud','Hud','هود','Hud',['7:65-72','11:50-60','26:123-140']],
['salih','Salih','صالح','Salih',['7:73-79','11:61-68','26:141-159']],
['ibrahim','Ibrahim','إبراهيم','Abraham',['6:74-83','19:41-50','21:51-73','2:124-132','37:99-113']],
['lut','Lut','لوط','Lot',['7:80-84','11:77-83','26:160-175']],
['ismail','Ismail','إسماعيل','Ishmael',['2:125-129','19:54-55','21:85-86']],
['ishaq','Ishaq','إسحاق','Isaac',['11:69-73','37:112-113','21:72-73']],
['yaqub','Yaqub','يعقوب','Jacob',['2:132-133','12:6-18','12:83-100']],
['yusuf','Yusuf','يوسف','Joseph',['12:4-101']],
['ayyub','Ayyub','أيوب','Job',['21:83-84','38:41-44']],
['shuayb','Shuayb','شعيب','Shuayb',['7:85-93','11:84-95','26:176-191']],
['musa','Musa','موسى','Moses',['20:9-98','28:3-46','7:103-156','18:60-82']],
['harun','Harun','هارون','Aaron',['20:29-36','20:90-94','19:53']],
['dhulkifl','Dhul-Kifl','ذو الكفل','Dhul-Kifl',['21:85-86','38:48']],
['dawud','Dawud','داود','David',['2:251','21:78-80','34:10-11','38:17-26']],
['sulayman','Sulayman','سليمان','Solomon',['27:15-44','21:78-82','34:12-14','38:30-40']],
['ilyas','Ilyas','إلياس','Elijah',['6:85','37:123-132']],
['alyasa','Al-Yasa','اليسع','Elisha',['6:86','38:48']],
['yunus','Yunus','يونس','Jonah',['10:98','21:87-88','37:139-148']],
['zakariyya','Zakariyya','زكريا','Zechariah',['3:37-41','19:2-15','21:89-90']],
['yahya','Yahya','يحيى','John',['3:39','19:7-15']],
['isa','Isa','عيسى','Jesus',['3:45-55','19:16-36','5:110-120','61:6']],
['muhammad','Muhammad','محمد','Muhammad',['33:40','21:107','48:29','3:144','96:1-5']]
].map(([id,name,ar,alias,refs])=>({id,name,ar,alias,refs}));
export const topics=[
['creation','Creation & the universe','The heavens, earth, life, and signs in creation.',['7:54','21:30-33','41:9-12','67:3-4','51:47-49']],
['belief','Faith & the unseen','Oneness of Allah, angels, revelation, and belief.',['112:1-4','2:255','2:285','4:136','35:1','72:1-15']],
['worship','Worship & devotion','Prayer, fasting, pilgrimage, and remembrance.',['2:43','2:183-187','2:196-203','20:14','62:9-10','13:28']],
['society','Society & justice','Dignity, fairness, consultation, and responsibility.',['4:58','4:135','5:8','16:90','42:38','49:9-13']],
['family','Family & relationships','Parents, marriage, children, and kinship.',['17:23-24','30:21','4:1','2:233','31:13-19','65:1-7']],
['wealth','Wealth & trade','Honest dealings, contracts, charity, and debt.',['2:275-283','4:29','9:60','83:1-6','2:261-274']],
['character','Character & conduct','Truthfulness, humility, forgiveness, and speech.',['49:11-12','25:63-76','33:70-71','3:134','17:36-37']],
['knowledge','Knowledge & reflection','Reading, learning, understanding, and wisdom.',['96:1-5','20:114','3:190-191','39:9','58:11']],
['mercy','Mercy & repentance','Hope, forgiveness, and returning to Allah.',['39:53-54','7:156','25:68-71','4:110','2:222']],
['trials','Patience & trials','Perseverance, gratitude, and trust.',['2:153-157','94:1-8','14:7','65:2-3','29:2-3']],
['stories','Other Quranic narratives','Maryam, the cave, Luqman, and Dhul-Qarnayn.',['19:16-36','18:9-26','31:12-19','18:83-98','28:76-82']],
['nature','Nature & living beings','Water, animals, plants, and the natural world.',['16:5-18','16:65-69','24:43-45','6:141','30:41']],
['death','Death & resurrection','Mortality, the barzakh, and rising again.',['3:185','23:99-100','39:68','36:78-83','75:1-15']],
['judgment','Judgment & accountability','The record, the balance, and recompense.',['99:1-8','21:47','18:49','84:7-12','101:6-11']],
['paradise','Jannah · Paradise','Descriptions of reward and peace in the Hereafter.',['47:15','55:46-78','56:10-40','76:5-22','89:27-30']],
['hell','Jahannam · Hell','Warnings, consequences, and accountability.',['4:56','67:6-11','78:21-30','39:71-72','74:26-31']]
].map(([id,name,description,refs])=>({id,name,description,refs}));
export const tracks={
origins:{name:'Creation & beginnings',description:'Quranic passages about creation. The reading order below does not assert a dated sequence or an exhaustive cosmology.',events:[
{id:'universe',title:'The heavens & the earth',ar:'السماوات والأرض',era:'Creation · no calendar date assigned',description:'Explore passages describing creation and the signs within it.',refs:['7:54','21:30-33','41:9-12'],hadith:[{label:'Sahih al-Bukhari 3191',url:'https://sunnah.com/bukhari:3191',note:'A report concerning the beginning of creation. Read the full report separately from the Quranic passages.'}]},
{id:'life',title:'Life & the living world',ar:'الحياة',era:'Creation themes · relationship not dated',description:'Water, living creatures, and the creation of humankind.',refs:['21:30','24:45','23:12-14']},
{id:'adam',title:'Adam',ar:'آدم',era:'Human beginnings · date unknown',description:'The angels, the garden, the trial, and guidance on earth.',refs:prophets[0].refs},
{id:'guidance',title:'Guidance for humanity',ar:'الهدى',era:'A recurring theme through human history',description:'Messengers, communities, and the promise of guidance.',refs:['2:38-39','16:36','40:78']}
]},
prophetic:{name:'Prophetic narratives',description:'A broad study sequence, not a complete dated chronology. Contemporary prophets are grouped; relative placement of several other prophets is uncertain. Open the Prophets directory for all 25 names.',events:[
['adam','Adam','آدم','Human beginnings · date unknown','The beginning of the human story.'],
['nuh','Nuh','نوح','Early communities · date unknown','A call to faith, the ark, and the flood.'],
['hud','Hud & Salih','هود وصالح','Ad and Thamud · dates unknown','Two communities and their messengers.'],
['ibrahim','Ibrahim & his family','إبراهيم','Abrahamic narratives · dates unknown','Ibrahim, Lut, Ismail, Ishaq, and Yaqub.'],
['yusuf','Yusuf','يوسف','After Yaqub · date unknown','Family, trials, service, and reconciliation.'],
['musa','Musa & Harun','موسى وهارون','Musa narratives · date unknown','Deliverance, revelation, and responsibility.'],
['dawud','Dawud & Sulayman','داود وسليمان','Dawud and his son · dates unknown','Judgment, wisdom, and gratitude.'],
['isa','Zakariyya, Yahya & Isa','عيسى','Related narratives · dates not assigned','Prayer, birth narratives, and prophethood.'],
['muhammad','Muhammad ﷺ','محمد','Final prophet · Quran 33:40','Revelation, mercy, and the believing community.']
].map(([id,title,ar,era,description])=>({id,title,ar,era,description,refs:prophets.find(p=>p.id===id).refs,...(id==='hud'?{refs:[...prophets[3].refs,...prophets[4].refs]}:{}),...(id==='dawud'?{refs:[...prophets[16].refs,...prophets[17].refs]}:{}),...(id==='musa'?{refs:[...prophets[13].refs,...prophets[14].refs]}:{}),...(id==='ibrahim'?{refs:[...prophets[5].refs,'11:69-83','19:54-55','2:132-133']}:{ }),...(id==='isa'?{refs:['19:2-36','3:37-55','5:110-120']}:{})}))},
revelation:{name:'Revelation & community',description:'Selected contexts linked to Quran and hadith. An event narrated in a verse is not necessarily the date that verse was revealed. Exact verse-by-verse revelation order is not asserted.',events:[
{id:'first',title:'The beginning of revelation',ar:'اقرأ',era:'Opening revelation · hadith-linked context',description:'Read the opening verses of Al-Alaq with the related report.',refs:['96:1-5'],hadith:[{label:'Sahih al-Bukhari 3',url:'https://sunnah.com/bukhari:3',note:'Report of the beginning of revelation. The attribution of these verses to that occasion comes from this report.'}]},
{id:'hijrah',title:'The migration & the cave',ar:'الهجرة',era:'Migration context · Quranic account',description:'The passage about the companion in the cave.',refs:['9:40'],hadith:[{label:'Sahih al-Bukhari 3653',url:'https://sunnah.com/bukhari:3653',note:'Abu Bakr narrates the encounter in the cave.'}]},
{id:'badr',title:'Badr',ar:'بدر',era:'Medinan community · Badr named in 3:123',description:'Help, steadfastness, and reliance upon Allah.',refs:['3:123-127','8:9-12']},
{id:'treaty',title:'The pledge & the promised entry',ar:'الفتح',era:'Medinan context · Al-Fath',description:'Passages concerning the pledge and entry into the Sacred Mosque.',refs:['48:18-29']}
]},
hereafter:{name:'Death & the Hereafter',description:'A separate eschatological study sequence. These events are not plotted on a human calendar; descriptions can overlap and this is not an exhaustive sequence.',events:[
{id:'death',title:'Death & the barzakh',ar:'الموت والبرزخ',era:'The end of earthly life',description:'Mortality and the barrier until resurrection.',refs:['3:185','23:99-100']},
{id:'resurrection',title:'Resurrection & gathering',ar:'البعث',era:'The Hereafter · time unknown',description:'The trumpet and the rising of creation.',refs:['39:68','36:51-54']},
{id:'judgment',title:'The record & the balance',ar:'الحساب',era:'The Hereafter · accountability',description:'Every deed is accounted for with justice.',refs:['18:49','21:47','99:6-8']},
{id:'destinations',title:'Jannah & Jahannam',ar:'الجنة والنار',era:'The Hereafter · recompense',description:'Read the descriptions of both outcomes in their context.',refs:['39:71-75','47:15','67:6-11']}
]}
};
