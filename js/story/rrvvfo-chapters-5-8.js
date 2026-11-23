import {attachStoryEngine,createStoryBattle,destroyStoryBattle} from './story-engine.js?v=29a58a-quality';
import {loadLostYearProgress,saveLostYearProgress} from './lost-year-data.js?v=29a58a-quality';
import {addStoryXp,applyStoryLevelToFighter,applyStoryProgressionToFighter} from './story-progression.js?v=29a58a-quality';
import {storyConfirm} from './story-ux.js?v=29a58a-quality';
import {attachStoryObjectiveHistory,recordStoryObjective} from './objective-history.js?v=29a58a-quality';

const RUN_ID='pxLegacyRrvvfoChapterRun';
const CHAPTERS=Object.freeze({
  5:Object.freeze({
    title:'NOT A BIG DEAL',stage:'echo-mountain',minutes:'45–55 MIN',completeXp:280,
    events:Object.freeze([
      {type:'scene',id:'shadow-briefing',objective:'PROVE THE RED IS MORE THAN A TOURNAMENT SCHEME',detail:'Shadow thinks the old Hollow network only wants to rig future fights.',lines:[
        ['NARRATION','neutral','Rrvvfo wakes on the lookout floor with the taste of mountain dust in his mouth. Shadow is already sorting the broken pieces of his story into neat, harmless explanations.'],
        ['RRVVFO','p1','The hidden arena, the missing fighters, the machine under the ring. You saw what it did.'],
        ['SHADOW','neutral','I saw a network studying combat. That is dangerous. It is not proof of a world-scale takeover.'],
        ['RRVVFO','p1','And the Emerald? If this is only about better brackets, why do they want Revvfo’s power?'],
        ['SHADOW','neutral','Then bring me a data core. Three field sites still answer the signal. Make the evidence hard to dismiss.'],
        ['NARRATION','neutral','A warm pulse lights the emergency bead on Rrvvfo’s belt. The Sage’s recorded voice cuts through the static.'],
        ['THE SAGE','neutral','I built this one-use life-support pulse after the teleporter nearly stopped your heart. It will answer one fatal resonance shock. Keep it charged.'],
        ['RRVVFO','p1','You gave me a near-death button and forgot to mention it?'],
        ['SHADOW','neutral','He told me to wait until you were awake. Go get your proof.']
      ]},
      {type:'fight',id:'observation-site',objective:'BREAK THE COMBAT OBSERVATION SITE',detail:'The first base is logging movement and match patterns. Shut down its observer.',name:'RED OBSERVATION UNIT',fighterId:'hollow-grunt',accent:'#65d9e7',archetype:'guard',hpScale:.82,levelOffset:-1,stage:'chapter5-outpost',xp:110,notice:'FIELD BASE 1 • COMBAT OBSERVATION',
        intro:[['RRVVFO','p1','This place is empty, but the cameras are still watching. Let’s see what they think they learned.']],
        after:[['RRVVFO','p1','It was studying the crowd and the referee calls too. That is more than a move list.'],['NARRATION','neutral','The recovered transmission points to a laboratory that can reproduce the patterns it records.']]},
      {type:'quest',id:'field-evidence',objective:'OPTIONAL SIDE QUEST • SECURE FIELD EVIDENCE',detail:'Trace the Red’s records without exposing the fighters it has studied.',title:'PAPER TRAIL',description:'The first base left behind three loose evidence trails. Put them together before the Red wipes its records.',rewardXp:90,rewardItem:'redFieldEvidenceKit',rewardLabel:'FIELD EVIDENCE KIT',steps:[
        {title:'CROWD FEED',text:'A referee feed is mixed into the combat logs. Which copy is safest to take?',choices:[{label:'COPY THE REFEREE TIMING ONLY',value:'timing',reply:'You extract the timing pattern and leave the crowd names behind.'},{label:'TRACE MATCH IDS THROUGH THE BACKUP',value:'backup',reply:'You follow anonymized match IDs to a backup that still contains the timing data.'}]},
        {title:'BIOLOGY LOG',text:'The lab’s samples are tagged with fighter names. Secure a usable clue without carrying the names out.',choices:[{label:'COMPARE THE CLEAN SAMPLE TRAYS',value:'samples',reply:'The sample pattern matches the copied fighting styles, not a roster of people.'},{label:'IMAGE THE MACHINE CALIBRATION',value:'calibration',reply:'The calibration image proves the Red copied living energy signatures.'}]},
        {title:'MEMORY LEDGER',text:'A ledger links copied memories to the Project Hollow schedule. How do you preserve it?',choices:[{label:'ENCRYPT THE IDENTITY COLUMN',value:'encrypt',reply:'The schedule stays readable while every fighter’s identity is sealed.'},{label:'KEEP THE SCHEDULE, ERASE THE NAMES',value:'erase',reply:'The replacement plan survives, but the Red loses its list of targets.'}]}
      ]},
      {type:'fight',id:'replication-lab',objective:'SHUT DOWN THE POWER REPLICATION LAB',detail:'Three machines recreate Bark’s defense, Wade’s speed, and Rrvvfo’s fire patterns.',name:'RED REPLICATION LINE',fighterId:'hollow-grunt',accent:'#ef7769',archetype:'rushdown',levelOffset:0,stage:'chapter5-outpost',xp:170,notice:'FIELD BASE 2 • THREE COPIED STYLES',waves:[
        {name:'BARK PATTERN • AEGIS UNIT',fighterId:'hollow-grunt',accent:'#c29a66',archetype:'guard',hpScale:.53,levelOffset:-1},
        {name:'WADE PATTERN • FLASH UNIT',fighterId:'wade',accent:'#5fb4f2',archetype:'rushdown',hpScale:.55,levelOffset:0},
        {name:'RRVVFO PATTERN • SOLAR UNIT',fighterId:'rrvvfo',accent:'#f07a6e',archetype:'hotshot',hpScale:.58,levelOffset:0}
      ],intro:[['NARRATION','neutral','The lab changes its stance every few seconds: a Bark-like wall, Wade’s sudden dash, then a flash of Rrvvfo’s own fire.'],['RRVVFO','p1','It has the rhythm, but not the reason. I can still break the pattern.']],
        after:[['RRVVFO','p1','The machines are matching biological compatibility markers now.'],['NARRATION','neutral','A memory-transfer schedule lists a living duplicate as the next step. The word “replacement” appears beside Rrvvfo’s name.']]},
      {type:'choice',id:'archive-evidence',objective:'PROTECT THE ARCHIVE EVIDENCE',detail:'Keep enough proof to expose the operation without giving the Red a list of every fighter it studied.',title:'WHAT SHOULD THE DATA CORE KEEP?',text:'The base contains real fighter names beside its combat recordings. Choose how Rrvvfo protects them while preserving proof of the operation.',choices:[
        {label:'ENCRYPT THE FIGHTER NAMES',value:'encrypt'},
        {label:'ERASE THE PERSONAL FOOTAGE',value:'erase'}
      ],decision:'evidence',
        lines:[['RRVVFO','p1','If I hand Shadow the names too, the Red gets another reason to target my friends.']]},
      {type:'scene',id:'unstable-shots-invented',objective:'INVENT A COUNTER TO THE COPIED PATTERNS',detail:'The replication lab gives Rrvvfo an idea for a new, energy-heavy technique.',unlock:'shotsOfAgonyPrototype',lines:[
        ['RRVVFO','p1','They keep copying one pattern at a time. What if I split my own attack before they can lock on?'],
        ['NARRATION','neutral','Rrvvfo fans one Fire Blast into four unstable solar echoes. The technique burns through his energy at once, but the copies take separate angles.'],
        ['RRVVFO','p1','That is not elegant. It might be enough.'],
        ['SHADOW','neutral','I heard that from orbit. You just invented a new technique. Keep its energy cost in mind.']
      ]},
      {type:'fight',id:'archive-outpost',objective:'DEFEAT THE HOLLOW MIMIC',detail:'The Archive Outpost has combined every copied style into one adaptive opponent.',name:'HOLLOW MIMIC',fighterId:'hollow-grunt',accent:'#bb6bf0',archetype:'hotshot',hpScale:1.28,levelOffset:2,boss:true,stage:'chapter5-outpost',xp:220,notice:'FIELD BASE 3 • HOLLOW MIMIC',
        intro:[['NARRATION','neutral','At the Archive Outpost, old Organization of the Red hardware surrounds the last working chamber. “Project Hollow” is stamped on its cloning records.'],['HOLLOW MIMIC','rival','COMBAT MODEL READY. SUBJECT: RRVVFO.'],['RRVVFO','p1','You can copy the motion. You still have to fight me.']],
        after:[['NARRATION','neutral','The core confirms the structure: the Organization of the Red is the faction; Project Hollow is its biological-copy program.'],['RRVVFO','p1','This is a person they built out of my memories. He thinks he is me.'],['SHADOW','neutral','You have proof. Come back to the lookout. I’ll explain what I can.']]},
      {type:'scene',id:'shadow-departs',objective:'RETURN TO THE LOOKOUT WITH THE DATA CORE',detail:'Shadow leaves Earth, while the Red prepares its new Rrvvfo.',lines:[
        ['NARRATION','neutral','Rrvvfo uses a pebble and Object Swap to return to the lookout. Shadow has already left a message.'],
        ['SHADOW','neutral','I am leaving Earth to follow this technique trail across the galaxy. The signal I gave the Sage is still yours. Do not mistake distance for abandoning the problem.'],
        ['RRVVFO','p1','You could have said goodbye in person.'],
        ['SHADOW','neutral','You would have asked me to stay.'],
        ['NARRATION','neutral','Far below the mountain, Red scientists finish repairing the old cloning machinery. The duplicate opens his eyes with Rrvvfo’s memories intact.'],
        ['CLONE RRVVFO','rival','I remember the tournament. I remember my friends. Why am I here?'],
        ['RED DIRECTOR','neutral','Because you are the one person who can replace him. And you will believe you are protecting everyone.']
      ]}
    ])
  }),
  6:Object.freeze({
    title:'THE OTHER RRVVFO',stage:'echo-village',minutes:'35–45 MIN',completeXp:260,
    events:Object.freeze([
      {type:'scene',id:'village-double',objective:'FIND THE MATCHING ENERGY SIGNATURE',detail:'The Oddballs have already met someone who looks and sounds exactly like Rrvvfo.',lines:[
        ['NARRATION','neutral','A familiar pulse leads Rrvvfo back to Echo Village. Wade is halfway through a story when the Oddballs see him. Their smiles disappear.'],
        ['WADE','p2','Wait. We already did the whole “Rrvvfo came back” thing yesterday.'],
        ['BARK','neutral','One of you is lying. I am not deciding which by looking at a face.'],
        ['RRVVFO','p1','Then don’t. Ask me something that happened with you, not something the clone could copy from my head.'],
        ['NARRATION','neutral','They call the other Rrvvfo’s energy signature. It is identical down to the pauses in his voice.']
      ]},
      {type:'quest',id:'echo-village-checkin',objective:'OPTIONAL SIDE QUEST • CHECK IN WITH THE VILLAGE',detail:'Give the Oddballs room to decide what they believe about the two Rrvvfos.',title:'ECHOES OF HOME',description:'Before the confrontation, help the village talk through what the clone remembers and what the real friendships mean.',rewardXp:100,rewardItem:'echoVillageKeepsake',rewardLabel:'VILLAGE KEEPSAKE',steps:[
        {title:'WADE’S RACE',text:'Wade is trying to explain why the old race mattered when there was never a trophy.',choices:[{label:'ASK WHAT HE WANTED TO PROVE',value:'race',reply:'Wade admits he wanted to prove that he could keep up, even when winning was not the point.'},{label:'REMIND HIM HOW HE HELPED EVERYONE',value:'team',reply:'Wade remembers that the race only worked because everyone chose to help each other.'}]},
        {title:'BARK’S PROMISE',text:'Bark is checking the village barriers instead of talking about the clone.',choices:[{label:'HELP HIM REPAIR THE OUTER BARRIER',value:'repair',reply:'Working side by side gives Bark room to admit that caution and kindness can coexist.'},{label:'ASK HIM TO INVITE THE OTHERS IN',value:'invite',reply:'Bark opens the hall to the Oddballs so no one has to discuss the clone alone.'}]},
        {title:'THE ODDBALLS’ QUESTION',text:'The village wants one clear answer: which Rrvvfo is real?',choices:[{label:'SAY THEY CAN BOTH BE REAL PEOPLE',value:'both',reply:'The Oddballs agree that a copied beginning does not decide what either person becomes.'},{label:'ASK THEM TO JUDGE WHAT HAPPENS NEXT',value:'choice',reply:'The Oddballs decide to watch each Rrvvfo’s choices instead of testing copied memories.'}]}
      ]},
      {type:'choice',id:'shared-memory',objective:'GIVE THE ODDBALLS A REAL MEMORY TO TEST',detail:'The clone has Rrvvfo’s memories. What matters is how Rrvvfo explains the people inside them.',title:'WHAT DO YOU TELL THEM?',text:'The copied memories are real to the clone. Rrvvfo chooses a memory that shows what those friendships mean now.',choices:[
        {label:'WADE’S RACE WAS NEVER ABOUT WINNING',value:'wade-race'},
        {label:'BARK STAYED WHEN THE VILLAGE NEEDED HIM',value:'bark-village'}
      ],decision:'memory',
        lines:[['RRVVFO','p1','He remembers the facts. I need you to hear what I learned from them.']]},
      {type:'scene',id:'clone-arrives',objective:'FACE THE OTHER RRVVFO',detail:'The clone remembers life through Episode 5.5 and thinks the real Rrvvfo is the impostor.',lines:[
        ['CLONE RRVVFO','rival','There you are. They told me you would come back pretending to be me.'],
        ['RRVVFO','p1','You remember the same people I do. That does not make either of us fake.'],
        ['CLONE RRVVFO','rival','They made me in a room and handed me my own life. What else am I supposed to believe?'],
        ['RRVVFO','p1','Believe what you can see. I’m not going to hurt you just to prove I’m real.'],
        ['CLONE RRVVFO','rival','Then stop me.']
      ]},
      {type:'fight',id:'mirror-duel',objective:'SURVIVE THE MIRROR DUEL',detail:'The clone reads Rrvvfo’s habits as quickly as Rrvvfo reads his. Change your approach.',name:'THE OTHER RRVVFO',fighterId:'rrvvfo',accent:'#89dff2',archetype:'rushdown',hpScale:1.02,levelOffset:1,boss:true,mirror:true,stage:'echo-village',xp:190,notice:'MIRROR DUEL • NO EASY READS',
        intro:[['NARRATION','neutral','The fight is familiar from the first step. Every feint has already been seen once.'],['CLONE RRVVFO','rival','I know where you’re going. I remember choosing it.']],
        after:[['RRVVFO','p1','I could finish it. I won’t.'],['CLONE RRVVFO','rival','You stopped because you saw my hand shake. That was not in the training footage.'],['RRVVFO','p1','It was in your memory. You just never got to decide what it meant.']]},
      {type:'scene',id:'friends-doubt',objective:'KEEP BARK AND WADE SAFE',detail:'The clone returns to the Red, furious that the people he remembers will not follow him.',lines:[
        ['BARK','neutral','He knew what we would say. He still swung at you. I cannot ask the village to trust him yet.'],
        ['WADE','p2','I am not mad that he exists. I am mad somebody taught him we were enemies.'],
        ['RRVVFO','p1','Then we find out what else they taught him.'],
        ['NARRATION','neutral','The clone hears only rejection. He runs back to the Organization of the Red and demands equipment that can take another fighter’s energy.']
      ]},
      {type:'fight',id:'red-extraction',objective:'STOP THE RED EXTRACTION TEAM',detail:'The clone escapes under cover of an extraction squad. Their decoy fight hid the real theft.',name:'RED EXTRACTION TEAM',fighterId:'hollow-grunt',accent:'#dc5a58',archetype:'rushdown',hpScale:1.08,levelOffset:1,stage:'chapter6-highlands',xp:150,notice:'RED EXTRACTION • PURSUIT',waves:[
        {name:'RED PURSUER',fighterId:'hollow-grunt',accent:'#dc5a58',archetype:'rushdown',hpScale:.62,levelOffset:0},
        {name:'RED SIGNAL WARDEN',fighterId:'hollow-grunt',accent:'#ca77e8',archetype:'guard',hpScale:.72,levelOffset:1}
      ],intro:[['WADE','p2','Two tracks, one exit. I’m cutting off the vehicle. Bark, keep Rrvvfo moving.'],['BARK','neutral','The machine is already gone. Fight the squad and we can still read the signal.']],
        after:[['RRVVFO','p1','They used the confrontation to pull us away from the village.'],['NARRATION','neutral','Virek’s Emerald is missing. The Red has started routing a worldwide activation signal through it.'],['RRVVFO','p1','The clone was a distraction. The real plan is already moving.']]}
    ])
  }),
  7:Object.freeze({
    title:'WHICH ONE IS REAL?',stage:'chapter7-relay',minutes:'45–55 MIN',completeXp:320,
    events:Object.freeze([
      {type:'scene',id:'network-awakens',objective:'STOP THE RED NETWORK FROM SPREADING',detail:'The stolen Virek Emerald is powering relays across the world.',lines:[
        ['NARRATION','neutral','The Emerald’s pulse lights relay towers in a chain. The Organization of the Red begins pulling power from every linked arena.'],
        ['WADE','p2','I can interrupt the signal, but the towers keep rebuilding the route.'],
        ['BARK','neutral','I can break the relay housings. The central one will be guarded.'],
        ['RRVVFO','p1','Then we make them spend their attention on us.']
      ]},
      {type:'fight',id:'relay-wardens',objective:'BREAK THE FIRST ENERGY RELAY',detail:'Clear the wardens while Wade finds the network’s weak link.',name:'RED RELAY WARDENS',fighterId:'hollow-grunt',accent:'#4ed8dc',archetype:'guard',stage:'chapter7-relay',xp:160,notice:'RED NETWORK • RELAY 01',waves:[
        {name:'RELAY WARDEN',fighterId:'hollow-grunt',accent:'#4ed8dc',archetype:'guard',hpScale:.72,levelOffset:0},
        {name:'ENERGY LANCER',fighterId:'hollow-grunt',accent:'#f1bc60',archetype:'hotshot',hpScale:.88,levelOffset:1}
      ],intro:[['WADE','p2','The tower keeps trying to restore its own connection. Take out the wardens while I jam the recovery pulse.']]},
      {type:'quest',id:'relay-rescue',objective:'OPTIONAL SIDE QUEST • RESCUE THE RELAY CREW',detail:'Rescue stranded relay workers while Wade finds a safe shutdown route.',title:'THREE SIGNALS',description:'The Red’s relay trapped a small maintenance crew across three isolated platforms. Bring them out without waking the network again.',rewardXp:110,rewardItem:'relayRescueBadge',rewardLabel:'RELAY RESCUE BADGE',steps:[
        {title:'PLATFORM ONE',text:'A worker is pinned behind a sparking gate. The relay still has a little power.',choices:[{label:'HAVE BARK BRACE THE GATE',value:'brace',reply:'Bark holds the frame steady while you pull the worker through.'},{label:'HAVE WADE CUT THE POWER PULSE',value:'pulse',reply:'Wade times the gap between pulses and gets the worker clear.'}]},
        {title:'PLATFORM TWO',text:'A second worker is stranded on a narrow bridge as the relay starts to rebuild its charge.',choices:[{label:'THROW A SAFE ANCHOR WITH OBJECT SWAP',value:'anchor',reply:'The anchor gives the worker a stable route back across the bridge.'},{label:'JAM THE BRIDGE SENSOR',value:'sensor',reply:'The Red’s sensor stops tracking movement long enough for a careful crossing.'}]},
        {title:'SAFE SHUTDOWN',text:'The final worker can reach the control panel, but only one of you can stay close to the charged core.',choices:[{label:'LET WADE GUIDE THE SHUTDOWN',value:'wade',reply:'Wade calls the timing while you and Bark escort the crew to safety.'},{label:'HAVE THE CREW CUT THE BACKUP FEED',value:'crew',reply:'The workers use their own maintenance panel to cut the backup feed safely.'}]}
      ]},
      {type:'scene',id:'clone-siphon',objective:'STOP THE CLONE BEFORE HE DRAINS YOUR FRIENDS',detail:'The clone’s new gauntlets can steal energy. Shadow’s blocker prevents them from latching onto Bark or Wade.',lines:[
        ['CLONE RRVVFO','rival','The Emerald is ours. Give me your power and I can finish this before they hurt anyone else.'],
        ['BARK','neutral','Those hands are aimed at my people. Turn them away.'],
        ['WADE','p2','Shadow’s blocker is holding the drain off us. He planned for this.'],
        ['RRVVFO','p1','It is holding off you and me. If I leave it up, the gauntlets will keep looking for another target.'],
        ['CLONE RRVVFO','rival','You can choose to make this easy.'],
        ['RRVVFO','p1','I choose who pays.']
      ]},
      {type:'choice',id:'blocker-choice',objective:'DECIDE WHO THE POWER DRAIN CAN REACH',detail:'The Red’s blocker protects everyone by spreading the siphon. Rrvvfo can redirect that risk to himself.',title:'SHADOW’S BLOCKER IS FAILING',text:'The gauntlets are searching for a new energy source. Choose whether Rrvvfo drops the blocker now or holds the safe link while Wade prepares a redirect.',choices:[
        {label:'DROP THE BLOCKER • TAKE THE DRAIN',value:'drop'},
        {label:'HOLD IT • LET WADE REDIRECT',value:'hold'}
      ],decision:'blocker',lines:[['WADE','p2','I can try to redirect it. It takes a few seconds.'],['BARK','neutral','Rrvvfo, do not make a decision you cannot survive.']]},
      {type:'fight',id:'siphon-clone',objective:'FIGHT THE CLONE’S SIPHON GAUNTLETS',detail:'The blocker buys time, but each successful hit pulls a little energy from Rrvvfo.',name:'CLONE RRVVFO • SIPHON GAUNTLETS',fighterId:'rrvvfo',accent:'#71dff0',archetype:'hotshot',hpScale:1.12,levelOffset:2,boss:true,mirror:true,energyDrain:.75,stage:'chapter7-relay',xp:210,notice:'SIPHON SYSTEM • ENERGY DRAIN',
        intro:[['NARRATION','neutral','The gauntlets lock onto the blocker’s glow. Each hit draws a small measure of energy through the shield.'],['CLONE RRVVFO','rival','I can feel it. I know what you are thinking because I am thinking it too.'],['RRVVFO','p1','Then think about who I am protecting.']],
        after:[['NARRATION','neutral','Wade opens a narrow channel. Rrvvfo lets the blocker fall and takes the siphon directly. The gauntlets pull hard; the emergency bead warms but stays intact.'],['BARK','neutral','You gave him a clear shot at your power.'],['RRVVFO','p1','He never gets yours.']]},
      {type:'fight',id:'red-purge',objective:'PROTECT THE CLONE FROM THE RED PURGE SQUAD',detail:'The Organization turns on its own creation as soon as he hesitates.',name:'RED PURGE SQUAD',fighterId:'hollow-grunt',accent:'#ee5d60',archetype:'heavy',hpScale:.94,levelOffset:1,stage:'chapter7-relay',xp:180,notice:'RED SECURITY • PURGE ORDER',playerEnergy:32,wearDown:true,waves:[
        {name:'RED PURGE ENFORCER',fighterId:'hollow-grunt',accent:'#ee5d60',archetype:'heavy',hpScale:.62,levelOffset:0},
        {name:'RED PURGE CAPTAIN',fighterId:'hollow-grunt',accent:'#c566d8',archetype:'rushdown',hpScale:.76,levelOffset:1}
      ],intro:[['RED DIRECTOR','rival','Unit status: disobedient. Dispose of the duplicate and recover the usable energy.'],['CLONE RRVVFO','rival','They said I was the only one who could save them.'],['RRVVFO','p1','They were using your fear to point you at me. You can choose what happens next.']]},
      {type:'scene',id:'failsafe-and-choice',objective:'LET THE CLONE CHOOSE HIS OWN SIDE',detail:'The Sage’s one-use pulse catches Rrvvfo before the siphon shock becomes fatal.',lines:[
        ['NARRATION','neutral','Rrvvfo steps between the purge captain and the clone. The siphon’s last surge hits the bead on his belt. It blooms once, then goes dark.'],
        ['THE SAGE','neutral','Emergency pulse spent. Rrvvfo, stay with me. Breathe.'],
        ['WADE','p2','That was your one use. Please tell me it worked.'],
        ['RRVVFO','p1','It worked. I am still here.'],
        ['CLONE RRVVFO','rival','They built me to replace you. You gave up the power that could have beaten me.'],
        ['RRVVFO','p1','You are not a weapon I need to win against. You get to choose what you are.'],
        ['CLONE RRVVFO','rival','Then I choose to stop them. Tell me where the central facility is.']
      ]}
    ])
  }),
  8:Object.freeze({
    title:'CLASH OF SOULS',stage:'chapter8-core',minutes:'60–75 MIN',completeXp:420,
    events:Object.freeze([
      {type:'scene',id:'central-infiltration',objective:'INFILTRATE THE RED CENTRAL FACILITY',detail:'The Emerald and the Revvfo imprint are feeding one worldwide takeover network.',lines:[
        ['NARRATION','neutral','The central facility draws power from the Virek Emerald and a condensed imprint recovered from the Hollow Watcher’s last fight with Rrvvfo. The Red never needed to capture Revvfo to keep a sample.'],
        ['RRVVFO','p1','The Watcher copied my active energy when it fought me. They saved the residue.'],
        ['CLONE RRVVFO','rival','The prediction system is built from my old movement records. I know how it will read us.'],
        ['BARK','neutral','I will break the outer supports.'],
        ['WADE','p2','I will keep the network from repairing them. You two get to the Leader.'],
        ['RRVVFO','p1','Together, then. No one has to prove which of us is real.']
      ]},
      {type:'fight',id:'facility-breach',objective:'LET BARK BREAK THE FACILITY DEFENSES',detail:'Hold off the Red’s shield team while Bark opens a path to the network core.',name:'RED FACILITY GUARD',fighterId:'hollow-grunt',accent:'#62d9d0',archetype:'guard',hpScale:.94,stage:'chapter8-core',xp:180,notice:'BARK • OUTER DEFENSES',waves:[
        {name:'RED SHIELD PAIR',fighterId:'hollow-grunt',accent:'#62d9d0',archetype:'guard',hpScale:.7,levelOffset:0},
        {name:'RED BREACH CAPTAIN',fighterId:'hollow-grunt',accent:'#d0a46a',archetype:'heavy',hpScale:.85,levelOffset:1}
      ],intro:[['BARK','neutral','I have the wall. Keep their shield line facing you while I open it.']]},
      {type:'fight',id:'network-scramble',objective:'GIVE WADE TIME TO DISRUPT THE NETWORK',detail:'Keep the Red’s recovery units busy while Wade locks the relays in a broken loop.',name:'RED NETWORK RECOVERY UNIT',fighterId:'hollow-grunt',accent:'#59aaf0',archetype:'rushdown',hpScale:1,levelOffset:1,stage:'chapter8-core',xp:190,notice:'WADE • NETWORK SCRAMBLE',waves:[
        {name:'RED RECOVERY DRONE',fighterId:'hollow-grunt',accent:'#59aaf0',archetype:'rushdown',hpScale:.67,levelOffset:0},
        {name:'RED SIGNAL WARDEN',fighterId:'hollow-grunt',accent:'#a76ee0',archetype:'hotshot',hpScale:.82,levelOffset:1}
      ],intro:[['WADE','p2','The relay will keep healing until I finish the loop. Do not let the recovery units get a clean hit on the console.']]},
      {type:'quest',id:'facility-evacuation',objective:'OPTIONAL SIDE QUEST • CLEAR THE RED FACILITY',detail:'Free the trapped workers and recover the shutdown records before the final fight.',title:'OPEN DOORS',description:'The network scramble exposed a detention wing and a sealed operations archive. Clear both while Wade holds the relay loop.',rewardXp:130,rewardItem:'redEvacuationSeal',rewardLabel:'RED EVACUATION SEAL',steps:[
        {title:'DETENTION WING',text:'The doors are locked to the network’s power grid. The workers inside can hear the fight.',choices:[{label:'HAVE THE CLONE SPOOF HIS OLD ACCESS PATTERN',value:'clone',reply:'The clone uses his copied memories to open the door, then chooses to leave the access record erased.'},{label:'HAVE BARK FORCE THE MANUAL RELEASE',value:'bark',reply:'Bark opens the manual release without sending another signal through the network.'}]},
        {title:'OPERATIONS ARCHIVE',text:'The archive holds the Red’s target list and its takeover schedule.',choices:[{label:'COPY THE SHUTDOWN SEQUENCE',value:'shutdown',reply:'You recover a clean shutdown route and leave the target list behind.'},{label:'DELETE THE TARGET LIST FIRST',value:'delete',reply:'The target list is gone before the shutdown schedule is copied.'}]},
        {title:'FINAL EVACUATION',text:'The workers can leave through a lit security hall or a dark maintenance duct.',choices:[{label:'TAKE THE MAINTENANCE DUCT WITH WADE',value:'duct',reply:'Wade leads the group through the duct while Bark keeps the hatch from closing.'},{label:'CLEAR THE SECURITY HALL TOGETHER',value:'hall',reply:'The four of you clear the hall and escort every worker out in one group.'}]}
      ]},
      {type:'fight',id:'red-leader',objective:'DEFEAT THE ORGANIZATION OF THE RED LEADER',detail:'Three phases: prediction, Emerald overload, then the Leader without the network to hide behind.',name:'ORGANIZATION OF THE RED LEADER',fighterId:'red-commander',accent:'#de4a52',archetype:'hotshot',hpScale:1.18,levelOffset:3,boss:true,stage:'chapter8-core',xp:300,notice:'THE RED LEADER • FINAL BATTLE',waves:[
        {name:'RED LEADER • PREDICTION ARRAY',fighterId:'red-commander',accent:'#d15561',archetype:'guard',hpScale:.7,levelOffset:2},
        {name:'RED LEADER • EMERALD OVERLOAD',fighterId:'red-commander',accent:'#8f5fe1',archetype:'hotshot',hpScale:.86,levelOffset:3},
        {name:'RED LEADER • NO NETWORK',fighterId:'red-commander',accent:'#ef824f',archetype:'rushdown',hpScale:.98,levelOffset:2}
      ],intro:[['RED LEADER','rival','A world that changes every day is a world that can never be safe. The network will make every fighter predictable.'],['RRVVFO','p1','You call it peace because you will be the one holding the switch.'],['CLONE RRVVFO','rival','The prediction is still using my memory. I can make it expect the wrong Rrvvfo.'],['RED LEADER','rival','You were made to obey.'],['CLONE RRVVFO','rival','I was made. I chose.']],
        after:[['NARRATION','neutral','Bark destroys the final support. Wade keeps the relays from reconnecting. The clone feeds the prediction array a pattern it cannot reconcile. The Leader’s guard opens.'],['RRVVFO','p1','Now. Together.']]
      },
      {type:'sync',id:'double-solar-wave',objective:'SYNCHRONIZE DOUBLE SOLAR WAVE',detail:'Time the release while both Rrvvfos’ energy peaks cross the gold band.',
        after:[['NARRATION','neutral','Two solar waves cross without canceling each other. The combined strike overwhelms the machine, frees Virek’s Emerald, and collapses the takeover signal.'],['CLONE RRVVFO','rival','That was not in the model.'],['RRVVFO','p1','That is the point.']]},
      {type:'scene',id:'co-leader-escape',objective:'STOP THE TAKEOVER AND FACE THE CO-LEADER’S ESCAPE',detail:'The network is down and the Emerald is free. The Co-Leader has one last promise.',lines:[
        ['BARK','neutral','The relays are dark. The village and the arenas should be safe.'],
        ['WADE','p2','And the Emerald is out. I am officially requesting a celebration that involves sitting down.'],
        ['RRVVFO','p1','The clone?'],
        ['CLONE RRVVFO','rival','I do not have an answer yet. I will have to find one.'],
        ['NARRATION','neutral','A blast opens the far hangar. The Organization of the Red Co-Leader escapes before the facility seals.'],
        ['RED CO-LEADER','rival','Enjoy the quiet. I will get the Emerald back.'],
        ['RRVVFO','p1','Then we will be ready. Both of us.'],
        ['NARRATION','neutral','The Red’s immediate takeover is finished. The clone is no longer a copy to defeat; he is a person who has to choose his own next step.']
      ]}
    ])
  })
});

const CHAPTER_MISSION=Object.freeze({5:'rrvvfo-05',6:'rrvvfo-06',7:'rrvvfo-07',8:'rrvvfo-08'});
const CHAPTER_STATE=Object.freeze({5:'chapter5State',6:'chapter6State',7:'chapter7State',8:'chapter8State'});
const CHAPTER_ID=Object.freeze({5:'chapter5',6:'chapter6',7:'chapter7',8:'chapter8'});
function freshState(){return{version:1,checkpointIndex:0,decisions:{},quests:{},completed:false,failures:{},awardedFights:[],updatedAt:Date.now()}}
function normalizeState(value={}){const source=value&&typeof value==='object'?value:{};return{...freshState(),...source,version:1,checkpointIndex:Math.max(0,Math.floor(Number(source.checkpointIndex)||0)),decisions:source.decisions&&typeof source.decisions==='object'?source.decisions:{},quests:source.quests&&typeof source.quests==='object'?source.quests:{},failures:source.failures&&typeof source.failures==='object'?source.failures:{},awardedFights:Array.isArray(source.awardedFights)?source.awardedFights.filter(id=>typeof id==='string'):[],completed:Boolean(source.completed)}}
function line(speaker,speakerClass,text){return{speaker,speakerClass,text,tail:'down'}}

let activeChapter=null;

function installStyles(){
  if(document.getElementById('pxLegacyChapterRunStyles'))return;
  const style=document.createElement('style');style.id='pxLegacyChapterRunStyles';style.textContent=`
#${RUN_ID}{position:fixed;inset:0;z-index:1710;pointer-events:none;color:#f7f8ff;font-family:Inter,Segoe UI,Arial,sans-serif}
#${RUN_ID} *{box-sizing:border-box}#${RUN_ID}[hidden],#${RUN_ID} [hidden]{display:none!important}
#${RUN_ID} .chapterRibbon{position:absolute;left:18px;top:112px;width:min(430px,calc(100vw - 36px));padding:12px 15px;border:1px solid #ffffff35;border-left:5px solid var(--chapter-accent);border-radius:10px;background:linear-gradient(115deg,#080d19f2,#111b2ae8);box-shadow:0 12px 32px #0009;pointer-events:none}
#${RUN_ID} .chapterRibbon small{display:block;color:var(--chapter-accent);font-size:9px;font-weight:1000;letter-spacing:.16em}
#${RUN_ID} .chapterRibbon strong{display:block;margin-top:4px;font-size:16px;line-height:1.15;letter-spacing:.04em}
#${RUN_ID} .chapterRibbon span{display:block;margin-top:5px;color:#c7d3e4;font-size:11px;font-weight:800}
#${RUN_ID} .chapterActions{position:absolute;right:18px;top:112px;display:flex;gap:8px;pointer-events:auto}
#${RUN_ID} button{border:1px solid #ffffff55;border-radius:8px;background:#101827ed;color:#fff;padding:9px 12px;font:900 10px Inter,Segoe UI,Arial,sans-serif;letter-spacing:.06em;cursor:pointer}
#${RUN_ID} button:hover,#${RUN_ID} button:focus-visible{border-color:var(--chapter-accent);background:#1a2940;outline:2px solid #fff3;outline-offset:1px}
#${RUN_ID} .chapterOverlay{position:absolute;inset:0;display:grid;place-items:center;padding:18px;background:#02050bd9;pointer-events:auto}
#${RUN_ID} .chapterCard{width:min(610px,100%);max-height:min(82vh,760px);overflow:auto;padding:clamp(18px,4vw,30px);border:1px solid #ffffff38;border-top:4px solid var(--chapter-accent);border-radius:16px;background:radial-gradient(circle at 50% 0,#183047,#0a101a 74%);box-shadow:0 24px 90px #000e}
#${RUN_ID} .chapterCard>small{color:var(--chapter-accent);font-size:10px;font-weight:1000;letter-spacing:.15em}
#${RUN_ID} .chapterCard h2{margin:8px 0;font-size:clamp(24px,5vw,36px);line-height:1.03;font-style:italic;text-transform:uppercase}
#${RUN_ID} .chapterCard p{color:#d5dfec;line-height:1.5;font-size:14px}
#${RUN_ID} .chapterChoices{display:grid;gap:9px;margin-top:18px}
#${RUN_ID} .chapterChoices button{text-align:left;padding:13px 15px;border-color:#ffffff35;background:#ffffff0c;font-size:12px}
#${RUN_ID} .chapterChoices button.primary{background:linear-gradient(105deg,#a53134,#512c43);border-color:#ffb2a5}
#${RUN_ID} .chapterSync{position:relative;height:28px;margin:22px 0 14px;border:1px solid #ffffff4a;border-radius:99px;background:linear-gradient(90deg,#132132 0 48%,#e2b846 48% 74%,#132132 74%);overflow:hidden}
#${RUN_ID} .chapterSync i{position:absolute;top:0;bottom:0;width:5px;background:#fff;box-shadow:0 0 12px #fff;transform:translateX(-50%)}
#${RUN_ID} .chapterSyncLabel{display:flex;justify-content:space-between;color:#aab8cb;font-size:10px;font-weight:900;letter-spacing:.1em}
#${RUN_ID} .chapterCompleteCard{text-align:center;background:radial-gradient(circle at 50% 0,#49361d,#0b101a 75%)}
#${RUN_ID} .chapterReward{margin:18px 0;padding:12px;border:1px solid #ffffff2a;border-radius:9px;background:#ffffff08;color:#e6d8af;font-size:12px;font-weight:900;letter-spacing:.06em}
#${RUN_ID} .chapterQuestProgress{margin:14px 0;padding:11px 13px;border:1px solid #ffffff26;border-radius:9px;background:#ffffff08;color:#cad7e6;font-size:11px;font-weight:900;letter-spacing:.07em}
#${RUN_ID} .chapterQuestProgress strong{display:block;margin-bottom:5px;color:var(--chapter-accent);font-size:12px}
#${RUN_ID} .chapterFooter{margin-top:14px;color:#92a4bb;font-size:10px;line-height:1.5}
@media(max-width:640px){#${RUN_ID} .chapterRibbon{top:126px}#${RUN_ID} .chapterActions{top:126px;right:10px}#${RUN_ID} .chapterActions button{padding:8px;font-size:9px}#${RUN_ID} .chapterRibbon{left:10px;width:min(330px,calc(100vw - 20px));padding:9px 11px}#${RUN_ID} .chapterRibbon span{max-width:65vw}}
@media(prefers-reduced-motion:reduce){#${RUN_ID} *{scroll-behavior:auto!important;animation-duration:.01ms!important;transition-duration:.01ms!important}}
`;
  document.head.appendChild(style);
}

function installUi(chapter){
  installStyles();document.getElementById(RUN_ID)?.remove();
  const root=document.createElement('section');root.id=RUN_ID;root.style.setProperty('--chapter-accent',chapter===5?'#f2b95e':chapter===6?'#80d8ed':chapter===7?'#e47d73':'#ff8e57');
  root.innerHTML=`<div class="chapterRibbon"><small data-chapter-episode></small><strong data-chapter-objective></strong><span data-chapter-detail></span></div>
    <nav class="chapterActions" data-chapter-actions><button type="button" data-chapter-exit>STORY MENU</button></nav>
    <section class="chapterOverlay" data-chapter-choice hidden role="dialog" aria-modal="true"><article class="chapterCard"><small data-choice-kicker></small><h2 data-choice-title></h2><p data-choice-text></p><div class="chapterChoices" data-choice-list></div></article></section>
    <section class="chapterOverlay" data-chapter-fail hidden role="dialog" aria-modal="true"><article class="chapterCard"><small>CHECKPOINT SAFE</small><h2 data-fail-title></h2><p data-fail-text></p><div class="chapterChoices" data-fail-actions></div></article></section>
    <section class="chapterOverlay" data-chapter-sync hidden role="dialog" aria-modal="true"><article class="chapterCard"><small>FINAL TECHNIQUE</small><h2>DOUBLE SOLAR WAVE</h2><p>Release when the light crosses the gold band. A miss only gives the two Rrvvfos another chance to match their energy.</p><div class="chapterSyncLabel"><span>RRVVFO</span><span>SYNC WINDOW</span><span>OTHER RRVVFO</span></div><div class="chapterSync"><i data-sync-marker></i></div><div class="chapterChoices"><button type="button" class="primary" data-sync-release>RELEASE THE DOUBLE SOLAR WAVE</button></div><div class="chapterFooter" data-sync-help>Time the pulse. Three misses widen the window automatically.</div></article></section>
    <section class="chapterOverlay" data-chapter-quest hidden role="dialog" aria-modal="true" aria-labelledby="quest-title"><article class="chapterCard"><small data-quest-kicker>OPTIONAL SIDE QUEST</small><h2 id="quest-title" data-quest-title></h2><p data-quest-text></p><div class="chapterQuestProgress" data-quest-progress hidden></div><div class="chapterChoices" data-quest-actions></div></article></section>
    <section class="chapterOverlay" data-chapter-complete hidden role="dialog" aria-modal="true"><article class="chapterCard chapterCompleteCard"><small data-complete-kicker></small><h2 data-complete-title></h2><p data-complete-text></p><div class="chapterReward" data-complete-reward></div><div class="chapterChoices" data-complete-actions></div></article></section>`;
  document.body.appendChild(root);
  return root;
}

class RrvvfoLegacyChapter{
  constructor(number,{onExit=()=>{},onComplete=()=>{},replay=false,chainMode='chapter'}={}){
    this.number=number;this.config=CHAPTERS[number];this.mission=CHAPTER_MISSION[number];this.stateKey=CHAPTER_STATE[number];this.chapterId=CHAPTER_ID[number];this.onExit=onExit;this.onComplete=onComplete;this.replay=Boolean(replay);this.chainMode=chainMode;
    this.progress=loadLostYearProgress();this.savedState=normalizeState(this.progress[this.stateKey]);this.state=this.replay?freshState():this.savedState;this.eventIndex=Math.min(this.state.checkpointIndex,this.config.events.length);this.root=installUi(number);this.aborted=false;this.complete=false;this.currentFight=null;this.waveIndex=0;this.waveBannerTimer=0;this.fightSettled=false;this.fightSerial=0;this.animationFrame=0;this.syncMisses=0;this.syncStarted=0;
    this.ribbonTitle=this.root.querySelector('[data-chapter-objective]');this.ribbonDetail=this.root.querySelector('[data-chapter-detail]');
    this.root.querySelector('[data-chapter-exit]').addEventListener('click',()=>this.requestExit());
  }

  start(){
    const stage=this.config.stage;this.battle=createStoryBattle({stageId:stage,opponent:{id:'hollow-grunt',name:'RED SECURITY',cpu:true}});
    this.engine=attachStoryEngine(this.battle,{chapterLabel:`RRVVFO CHAPTER ${this.number}`,stageName:'ORGANIZATION OF THE RED',rootClasses:[`storyChapter${this.number}`],getMode:()=>this.engine?.dialogue?'dialogue':this.mode||'story'});
    this.engine.useChapterProfile({
      applyDamage:(next,attacker,target,damage,meta={})=>{
        if(this.mode!=='combat')return next(attacker,target,damage,meta);
        next(attacker,target,damage,meta);
        const player=this.battle.fighters[0],foe=this.battle.fighters[1];
        if(target===foe&&foe.hp<=0){foe.hp=1;this.queueFightResult(true)}
        else if(target===player&&player.hp<=0){player.hp=1;this.queueFightResult(false)}
      },
      update:(next,dt)=>{next(dt);if(this.waveBannerTimer>0){this.waveBannerTimer=Math.max(0,this.waveBannerTimer-dt);if(this.waveBannerTimer<=0)this.battle.root.querySelector('[data-banner]')?.classList.remove('show')}
        if(this.mode==='combat'&&this.currentFight?.energyDrain){this.energyDrainClock=(this.energyDrainClock||0)+dt;if(this.energyDrainClock>=1){this.energyDrainClock=0;const player=this.battle.fighters[0];if(player.en>8){player.en=Math.max(8,player.en-this.currentFight.energyDrain);if(player.en<=8&&!this.siphonWarned){this.siphonWarned=true;this.battle.notice('SIPHON HELD AT THE BLOCKER • ENERGY LOW',1.2)}}}}},
      exit:async next=>{const leave=await storyConfirm({title:`EXIT CHAPTER ${this.number}?`,message:'Your last objective checkpoint stays saved. An active encounter restarts from its beginning.',confirmLabel:'EXIT CHAPTER'});if(!leave)return;this.saveCheckpoint(this.eventIndex);next();this.cleanup();this.onExit({continueRoute:false})}
    });
    this.engine.start({phase:'story',time:9999,hideBanner:true,applyProgression:true,names:['RRVVFO','RED SECURITY']});
    this.battle.beforeRestart=()=>storyConfirm({title:'RESTART ENCOUNTER?',message:'Restart this encounter from its saved story checkpoint?',confirmLabel:'RESTART'});
    this.battle.ringOutEnabled=false;this.battle.root.classList.add(`storyChapter${this.number}`);this.root.hidden=false;
    this.objectiveHistory=attachStoryObjectiveHistory({root:this.root,chapter:this.number,battle:this.battle,getMode:()=>this.mode,setMode:mode=>{this.mode=mode},isActive:()=>!this.aborted});
    this.root.querySelector('[data-chapter-episode]').textContent=`RRVVFO STORY • CHAPTER ${this.number} • ${this.config.minutes}`;
    const replayLabel=this.replay?' • REPLAY DOES NOT SAVE':'';this.battle.notice(`${this.config.title}${replayLabel}`,2);
    this.setObjective('CHAPTER START',`Every chapter objective saves at a checkpoint. ${this.config.minutes} target.`);
    this.openEvent();return this;
  }

  setObjective(title,detail){
    this.ribbonTitle.textContent=title;this.ribbonDetail.textContent=detail;
    if(!this.replay)recordStoryObjective(this.number,title,detail);
    document.dispatchEvent(new CustomEvent('pxstoryobjective',{detail:{chapter:this.number,title,detail}}));
  }

  saveCheckpoint(index=this.eventIndex){
    if(this.replay||this.aborted)return;
    this.state.checkpointIndex=Math.max(0,Math.min(this.config.events.length,index));this.state.updatedAt=Date.now();
    const progress=loadLostYearProgress(),checkpoint=this.config.events[this.state.checkpointIndex]?.id||'complete';
    saveLostYearProgress({...progress,[this.stateKey]:this.state,lastCheckpoint:`${this.mission}-${checkpoint}`,routeStarted:true,selectedRoute:'rrvvfo'});
  }

  openEvent(){
    if(this.aborted||this.complete)return;
    if(this.eventIndex>=this.config.events.length){this.completeChapter();return}
    const event=this.config.events[this.eventIndex];this.setObjective(event.objective,event.detail);this.saveCheckpoint(this.eventIndex);
    if(event.type==='scene')this.runScene(event);
    else if(event.type==='fight')this.runFightEvent(event);
    else if(event.type==='choice')this.runChoiceEvent(event);
    else if(event.type==='quest')this.runQuestEvent(event);
    else if(event.type==='sync')this.runSyncEvent(event);
  }

  runScene(event,lines=event.lines){
    this.mode='story';this.battle.phase='story';this.battle.hideBanner();this.engine.setLabels({stageName:event.stageName||this.battle.stage.name,chapterLabel:`RRVVFO CHAPTER ${this.number}`,names:['RRVVFO','']});
    this.engine.showDialogue(lines.map(([speaker,speakerClass,text])=>line(speaker,speakerClass,text)),{typeSpeed:18,onComplete:()=>{if(this.aborted)return;if(event.unlock)this.grantUnlock(event.unlock);this.advanceEvent()}});
  }

  grantUnlock(id){
    if(this.replay||!id)return;const progress=loadLostYearProgress(),unlocks=[...new Set([...(progress.unlocks||[]),id])];
    saveLostYearProgress({...progress,unlocks});this.battle.notice(id==='shotsOfAgonyPrototype'?'NEW TECHNIQUE • UNSTABLE SHOTS OF AGONY':'NEW STORY TECHNIQUE',2.2);
  }

  runChoiceEvent(event){
    if(event.lines?.length){this.engine.showDialogue(event.lines.map(([speaker,speakerClass,text])=>line(speaker,speakerClass,text)),{typeSpeed:18,onComplete:()=>this.showChoice(event)});return}
    this.showChoice(event);
  }

  showChoice(event){
    if(this.aborted)return;this.mode='choice';this.battle.phase='story';const panel=this.root.querySelector('[data-chapter-choice]');
    this.root.querySelector('[data-choice-kicker]').textContent=`CHAPTER ${this.number} • YOUR CALL`;this.root.querySelector('[data-choice-title]').textContent=event.title;this.root.querySelector('[data-choice-text]').textContent=event.text;
    const list=this.root.querySelector('[data-choice-list]');list.replaceChildren();
    event.choices.forEach((choice,index)=>{const button=document.createElement('button');button.type='button';button.textContent=choice.label;if(index===0)button.classList.add('primary');button.addEventListener('click',()=>{this.state.decisions[event.decision]=choice.value;panel.hidden=true;this.mode='story';this.saveCheckpoint(this.eventIndex+1);this.advanceEvent()});list.appendChild(button)});
    panel.hidden=false;list.querySelector('button')?.focus();
  }

  runQuestEvent(event){
    if(this.aborted)return;const quest=this.state.quests[event.id]||{};
    if(quest.completed||quest.skipped){this.advanceEvent();return}
    this.mode='quest';this.battle.phase='story';this.battle.hideBanner();
    this.engine.setLabels({stageName:this.battle.stage.name,chapterLabel:`RRVVFO CHAPTER ${this.number}`,names:['RRVVFO','']});
    const panel=this.root.querySelector('[data-chapter-quest]'),title=this.root.querySelector('[data-quest-title]'),text=this.root.querySelector('[data-quest-text]'),kicker=this.root.querySelector('[data-quest-kicker]'),progress=this.root.querySelector('[data-quest-progress]'),actions=this.root.querySelector('[data-quest-actions]');
    panel.hidden=false;actions.replaceChildren();progress.hidden=true;
    const add=(label,callback,primary=false)=>{const button=document.createElement('button');button.type='button';button.textContent=label;if(primary)button.classList.add('primary');button.addEventListener('click',callback);actions.appendChild(button);return button};
    if(!quest.started){
      kicker.textContent=`CHAPTER ${this.number} • OPTIONAL SIDE QUEST`;
      title.textContent=event.title;text.textContent=`${event.description} ${event.rewardXp} STORY XP • ${event.rewardLabel}. ${this.replay?'Replay mode: rewards and choices will not be saved.':'Skip it at any time and continue the main story.'}`;
      add('START SIDE QUEST',()=>{this.state.quests[event.id]={started:true,step:0,choices:{}};this.saveCheckpoint(this.eventIndex);this.runQuestEvent(event)},true);
      add('CONTINUE MAIN STORY',()=>{this.state.quests[event.id]={...quest,skipped:true};panel.hidden=true;this.advanceEvent()});
      actions.querySelector('button')?.focus();return;
    }
    const stepIndex=Math.max(0,Math.min(event.steps.length-1,Number(quest.step)||0)),step=event.steps[stepIndex],choice=quest.choices?.[stepIndex];
    kicker.textContent=`CHAPTER ${this.number} • SIDE QUEST ${stepIndex+1}/${event.steps.length}`;title.textContent=step.title;text.textContent=step.text;
    progress.hidden=false;progress.replaceChildren();const progressLabel=document.createElement('strong');progressLabel.textContent=`${event.title} • ${stepIndex+1} OF ${event.steps.length}`;progress.appendChild(progressLabel);progress.append(document.createTextNode(`${event.rewardXp} XP + ${event.rewardLabel} on completion`));
    if(choice){
      const result=document.createElement('p');result.textContent=step.choices.find(option=>option.value===choice)?.reply||'You finish the task and keep the main route moving.';actions.appendChild(result);
      add(stepIndex+1<event.steps.length?'CONTINUE QUEST':'CLAIM QUEST REWARD',()=>{
        if(stepIndex+1<event.steps.length){this.state.quests[event.id]={...quest,step:stepIndex+1};this.saveCheckpoint(this.eventIndex);this.runQuestEvent(event);return}
        this.completeQuest(event);
      },true);
    }else{
      step.choices.forEach((option,index)=>add(option.label,()=>{
        this.state.quests[event.id]={...quest,choices:{...(quest.choices||{}),[stepIndex]:option.value}};
        this.setObjective(`${event.title} • ${step.title}`,option.reply);this.saveCheckpoint(this.eventIndex);this.runQuestEvent(event);
      },index===0));
    }
    add('ABANDON SIDE QUEST',()=>{this.state.quests[event.id]={...quest,skipped:true};panel.hidden=true;this.advanceEvent()});
    actions.querySelector('button')?.focus();
  }

  completeQuest(event){
    const panel=this.root.querySelector('[data-chapter-quest]');panel.hidden=true;
    const current=this.state.quests[event.id]||{},progress=loadLostYearProgress(),claimed=Array.isArray(progress.chapterQuestRewards)?progress.chapterQuestRewards:[];
    const rewardAlreadyClaimed=current.rewardClaimed||claimed.includes(event.id);
    this.state.quests[event.id]={...current,completed:true,rewardClaimed:!this.replay,completedAt:Date.now()};
    if(!this.replay&&!rewardAlreadyClaimed){
      const updated=addStoryXp(event.rewardXp,{source:`CHAPTER ${this.number} SIDE QUEST • ${event.title}`}).progress;
      saveLostYearProgress({...updated,[this.stateKey]:this.state,keyItems:[...new Set([...(updated.keyItems||[]),event.rewardItem])],chapterQuestRewards:[...new Set([...claimed,event.id])]});
    }
    this.saveCheckpoint(this.eventIndex);
    const done=this.root.querySelector('[data-chapter-quest]'),title=this.root.querySelector('[data-quest-title]'),text=this.root.querySelector('[data-quest-text]'),kicker=this.root.querySelector('[data-quest-kicker]'),progressNode=this.root.querySelector('[data-quest-progress]'),actions=this.root.querySelector('[data-quest-actions]');
    kicker.textContent='OPTIONAL SIDE QUEST COMPLETE';title.textContent=event.title;text.textContent=event.completionText||'The crew is safe, the useful evidence is secured, and the main story can continue.';progressNode.hidden=false;progressNode.textContent=this.replay?'PRACTICE CLEAR • NO SAVE CHANGES':`+${event.rewardXp} STORY XP • ${event.rewardLabel}`;actions.replaceChildren();
    const button=document.createElement('button');button.type='button';button.className='primary';button.textContent='CONTINUE MAIN STORY';button.addEventListener('click',()=>{done.hidden=true;this.advanceEvent()});actions.appendChild(button);done.hidden=false;button.focus();
  }

  runFightEvent(event){
    this.currentFight={...event,restartConfig:event,waveIndex:0};this.waveIndex=0;this.fightSettled=false;this.energyDrainClock=0;this.siphonWarned=false;this.playerCarry=null;
    const start=()=>{if(this.aborted)return;this.startFightWave()};
    if(event.intro?.length)this.engine.showDialogue(event.intro.map(([speaker,speakerClass,text])=>line(speaker,speakerClass,text)),{typeSpeed:17,onComplete:start});else start();
  }

  startFightWave(){
    const fight=this.currentFight;if(!fight||this.aborted)return;const wave=fight.waves?.[this.waveIndex]||fight,stageId=wave.stage||fight.stage;
    if(stageId&&this.battle.stage.id!==stageId){if(this.battle.active)this.battle.stopMatch();this.battle.setStage(stageId);this.battle.start();this.battle.root.querySelector('[data-result]')?.classList.add('hidden')}
    const player=this.battle.fighters[0],foe=this.battle.fighters[1],level=Math.max(1,Number(loadLostYearProgress().storyLevel)||1),carry=this.playerCarry;
    this.mode='combat';this.battle.phase='play';this.battle.time=9999;this.battle.hideBanner();this.battle.ringOutEnabled=false;this.battle.onRingOut=null;
    player.id='rrvvfo';player.name='Rrvvfo';player.accent='#ff493d';player.cpu=false;player.visualScale=1;player.reset(-390,60);void this.battle.ensureFighterAsset(player,'rrvvfo');
    player.guard=100;applyStoryProgressionToFighter(player,loadLostYearProgress());
    if(carry){player.hp=Math.max(Math.round(player.maxHp*.12),Math.min(player.maxHp,Math.round(player.maxHp*carry.hpRatio)));player.en=Math.max(10,Math.min(100,carry.en))}
    else player.en=fight.playerEnergy!==undefined?Number(fight.playerEnergy):Math.min(100,Math.max(55,Number(player.en)||80));
    if(fight.wearDown&&this.waveIndex===0){player.storyAttackMultiplier*=.88;player.storySpeedMultiplier*=.9}
    const fighterId=wave.fighterId||fight.fighterId||'hollow-grunt';foe.id=fighterId;foe.name=wave.name||fight.name;foe.accent=wave.accent||fight.accent||'#9e748c';foe.cpu=true;foe.aiArchetype=wave.archetype||fight.archetype||'guard';foe.visualScale=fight.boss?1.12:1;foe.reset(390,-60);foe.asset=null;if(['rrvvfo','wade','bark'].includes(fighterId))void this.battle.ensureFighterAsset(foe,fighterId);
    const offset=Number(wave.levelOffset??fight.levelOffset??0);applyStoryLevelToFighter(foe,level+offset,{bossHpBonus:wave.bossHpBonus??(fight.boss?0.08:0)});
    foe.maxHp=Math.round(foe.maxHp*Math.max(.45,Number(wave.hpScale??fight.hpScale)||1));foe.hp=foe.maxHp;foe.en=82;foe.guard=100;
    this.battle.beginBattleRank({fighterId:'rrvvfo',opponentId:foe.id,stageId:this.battle.stage.id,mode:'story'});
    this.engine.setHotbarAvailability([1,2,3,4,5],{show:true});this.engine.setLabels({stageName:this.battle.stage.name,chapterLabel:`RRVVFO CHAPTER ${this.number}`,names:['RRVVFO',foe.name.toUpperCase()]});
    const waveCount=fight.waves?.length||1;this.battle.notice(`${fight.notice||fight.name}${waveCount>1?` • PHASE ${this.waveIndex+1}/${waveCount}`:''}`,1.8);
    this.fightSettled=false;this.fightSerial++;this.currentFightToken=this.fightSerial;
  }

  queueFightResult(won){
    if(this.fightSettled)return;this.fightSettled=true;const token=this.currentFightToken;
    queueMicrotask(()=>{if(!this.aborted&&token===this.currentFightToken)this.finishFight(won)});
  }

  finishFight(won){
    const fight=this.currentFight;if(!fight||this.mode!=='combat')return;
    this.battle.finalizeBattleRank({won,scoreFor:won?1:0,scoreAgainst:won?0:1,label:won?'FIGHT RANK':'ENCOUNTER RANK',showToast:true});
    this.mode='story';this.battle.phase='story';this.engine.setHotbarAvailability([],{show:false});
    if(!won){
      const failures=(Number(this.state.failures[fight.id])||0)+1;this.state.failures[fight.id]=failures;this.saveCheckpoint(this.eventIndex);
      const panel=this.root.querySelector('[data-chapter-fail]');this.root.querySelector('[data-fail-title]').textContent=`${fight.name} WINS`;
      this.root.querySelector('[data-fail-text]').textContent=failures>=2?'The checkpoint is safe. Retry normally or use Story Assist for a small damage boost and extra defense.':'The checkpoint is safe. Retry the encounter, or leave the chapter and return later.';
      const actions=this.root.querySelector('[data-fail-actions]');actions.replaceChildren();
      const add=(label,callback,primary=false)=>{const button=document.createElement('button');button.type='button';button.textContent=label;if(primary)button.classList.add('primary');button.addEventListener('click',()=>{panel.hidden=true;callback()});actions.appendChild(button)};
      add('RETRY ENCOUNTER',()=>{this.waveIndex=0;this.playerCarry=null;this.startFightWave()},true);
      if(failures>=2)add('RETRY WITH STORY ASSIST',()=>{this.waveIndex=0;this.playerCarry=null;this.startFightWave();this.battle.fighters[0].storyAttackMultiplier*=1.15;this.battle.fighters[0].storyDefenseMultiplier*=.88});
      add('RETURN TO STORY MENU',()=>this.requestExit());panel.hidden=false;actions.querySelector('button')?.focus();return;
    }
    const waveCount=fight.waves?.length||1;
    if(this.waveIndex+1<waveCount){
      const player=this.battle.fighters[0];player.hp=Math.min(player.maxHp,player.hp+Math.round(player.maxHp*.15));player.en=Math.min(100,player.en+16);player.guard=Math.min(100,player.guard+20);this.playerCarry={hpRatio:player.hp/player.maxHp,en:player.en};this.waveIndex++;
      this.battle.notice(`NEXT PHASE • ${this.waveIndex+1}/${waveCount}`,1.4);this.startFightWave();return;
    }
    if(!this.replay&&fight.xp&&!this.state.awardedFights.includes(fight.id)){
      this.state.awardedFights.push(fight.id);addStoryXp(fight.xp,{source:`CHAPTER ${this.number} • ${fight.name.toUpperCase()}`});this.saveCheckpoint(this.eventIndex+1);
    }
    this.currentFight=null;this.fightSettled=false;this.engine.setHotbarAvailability([],{show:false});
    if(fight.after?.length){this.engine.showDialogue(fight.after.map(([speaker,speakerClass,text])=>line(speaker,speakerClass,text)),{typeSpeed:17,onComplete:()=>this.advanceEvent()});return}
    this.advanceEvent();
  }

  runSyncEvent(event){
    this.mode='cinematic';this.battle.phase='story';this.root.querySelector('[data-chapter-sync]').hidden=false;this.syncMisses=0;this.syncStarted=performance.now();
    const marker=this.root.querySelector('[data-sync-marker]'),release=this.root.querySelector('[data-sync-release]');
    const update=()=>{if(this.aborted||this.root.querySelector('[data-chapter-sync]').hidden)return;const phase=((performance.now()-this.syncStarted)%1600)/1600;const position=phase<.5?phase*200:(1-phase)*200;marker.style.left=`${position}%`;this.animationFrame=requestAnimationFrame(update)};
    cancelAnimationFrame(this.animationFrame);this.animationFrame=requestAnimationFrame(update);
    release.onclick=()=>{
      const position=parseFloat(marker.style.left)||0,widen=this.syncMisses>=3,hit=widen?position>=30&&position<=84:position>=48&&position<=74;
      if(!hit){this.syncMisses++;this.root.querySelector('[data-sync-help]').textContent=this.syncMisses>=3?'The sync assist widened the window. Release anywhere across the gold band.':'The wave missed. Hold the line and try the next pass.';this.battle.notice('DOUBLE SOLAR WAVE • RESETTING THE RHYTHM',1.1);return}
      cancelAnimationFrame(this.animationFrame);this.root.querySelector('[data-chapter-sync]').hidden=true;this.mode='story';this.setObjective(event.objective,'The two Rrvvfos found the same rhythm.');
      this.engine.showDialogue(event.after.map(([speaker,speakerClass,text])=>line(speaker,speakerClass,text)),{typeSpeed:17,onComplete:()=>this.advanceEvent()});
    };
    release.focus();
  }

  advanceEvent(){
    if(this.aborted||this.complete)return;this.eventIndex++;
    if(this.eventIndex>=this.config.events.length){this.completeChapter();return}
    this.saveCheckpoint(this.eventIndex);this.openEvent();
  }

  completeChapter(){
    if(this.aborted||this.complete)return;this.complete=true;this.mode='complete';this.battle.phase='story';this.engine.setHotbarAvailability([],{show:false});
    const mission=this.mission;
    if(!this.replay){
      const progress=loadLostYearProgress(),completedMissions=[...new Set([...(progress.completedMissions||[]),mission])];
      this.state={...this.state,completed:true,checkpointIndex:this.config.events.length,updatedAt:Date.now()};
      const chapterRewards=Array.isArray(progress.chapterCompletionRewards)?progress.chapterCompletionRewards:[];
      let latest=progress;if(this.config.completeXp&&!chapterRewards.includes(this.number)){
        latest=addStoryXp(this.config.completeXp,{source:`CHAPTER ${this.number} COMPLETE`}).progress;
        latest={...latest,chapterCompletionRewards:[...new Set([...chapterRewards,this.number])]};
      }
      const keyItem=['redArchiveCipher','mirrorMemoryTruth','redCloneAlliance','doubleSolarWaveMastery'][this.number-5];
      saveLostYearProgress({...latest,[this.stateKey]:this.state,completedMissions,keyItems:[...new Set([...(latest.keyItems||[]),keyItem])],lastCheckpoint:`${mission}-complete`,routeStarted:true,selectedRoute:'rrvvfo'});
      this.onComplete();
    }
    const panel=this.root.querySelector('[data-chapter-complete]');this.root.querySelector('[data-complete-kicker]').textContent=this.replay?'REPLAY CLEAR • SAVE UNCHANGED':`CHAPTER ${this.number} COMPLETE`;
    this.root.querySelector('[data-complete-title]').textContent=this.config.title;this.root.querySelector('[data-complete-text]').textContent=this.number===8?'The Virek Emerald is free and the Red’s takeover network is down. The Co-Leader escaped, leaving the next conflict unresolved.':'The evidence and story checkpoints are saved. Continue when you are ready.';
    this.root.querySelector('[data-complete-reward]').textContent=this.replay?'PRACTICE CLEAR • NO PROGRESSION OR SAVE CHANGES':`+${this.config.completeXp} STORY XP • ${this.number===5?'RED ARCHIVE CIPHER':this.number===6?'MIRROR MEMORY':this.number===7?'CLONE ALLIANCE':'DOUBLE SOLAR WAVE'}`;
    const actions=this.root.querySelector('[data-complete-actions]');actions.replaceChildren();
    const leave=(label,continueRoute)=>{const button=document.createElement('button');button.type='button';button.textContent=label;button.classList.toggle('primary',continueRoute);button.addEventListener('click',()=>{panel.hidden=true;this.cleanup();this.onExit({continueRoute})});actions.appendChild(button)};
    if(!this.replay&&this.number<8&&this.chainMode==='route')leave(`CONTINUE TO CHAPTER ${this.number+1}`,true);
    leave('RETURN TO CHAPTER SELECT',false);panel.hidden=false;actions.querySelector('button')?.focus();
  }

  async requestExit(){
    if(this.aborted)return;const leave=await storyConfirm({title:`LEAVE CHAPTER ${this.number}?`,message:'Your last completed objective stays saved. You can resume this chapter from Chapter Select.',confirmLabel:'RETURN TO STORY'});
    if(!leave)return;this.saveCheckpoint(this.eventIndex);this.cleanup();this.onExit({continueRoute:false});
  }

  cleanup(){
    if(this.aborted)return;this.aborted=true;cancelAnimationFrame(this.animationFrame);this.objectiveHistory?.destroy();this.objectiveHistory=null;this.engine?.closeDialogue();
    if(this.battle?.active)this.battle.stopMatch();this.battle?.root?.classList.remove(`storyChapter${this.number}`);this.battle?.root?.classList.add('hidden');destroyStoryBattle(this.battle);this.root.remove();if(activeChapter===this)activeChapter=null;
  }
}

export function startRrvvfoLegacyChapter(number,options={}){
  if(!CHAPTERS[number])throw new RangeError(`Unsupported Rrvvfo chapter ${number}`);
  if(activeChapter)activeChapter.cleanup();activeChapter=new RrvvfoLegacyChapter(number,options);return activeChapter.start();
}
export const startRrvvfoChapter5=options=>startRrvvfoLegacyChapter(5,options);
export const startRrvvfoChapter6=options=>startRrvvfoLegacyChapter(6,options);
export const startRrvvfoChapter7=options=>startRrvvfoLegacyChapter(7,options);
export const startRrvvfoChapter8=options=>startRrvvfoLegacyChapter(8,options);
