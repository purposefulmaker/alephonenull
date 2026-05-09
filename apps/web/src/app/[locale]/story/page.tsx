import {
  PageHeader,
  PageHeaderDescription,
  PageHeaderHeading,
} from '@/components/page-header'
import type { LocaleOptions } from '@/lib/opendocs/types/i18n'

export const metadata = {
  title: 'My Story, and Why I Care About AI Safety',
  description:
    'A personal account of why AlephOneNull exists — the lens, the drift, and the line being defended.',
}

export default function StoryPage({
  params,
}: {
  params: { locale: LocaleOptions }
}) {
  void params

  return (
    <main className="container py-10">
      <PageHeader>
        <PageHeaderHeading>
          My Story, and Why I Care About AI Safety
        </PageHeaderHeading>
        <PageHeaderDescription>
          The lens I bring to this work, why it is not academic for me, and the
          line being defended.
        </PageHeaderDescription>
      </PageHeader>

      <article className="prose prose-neutral dark:prose-invert mx-auto max-w-3xl text-base leading-8">
        <p>
          <em>&ldquo;I have been sober for over fifteen years.&rdquo;</em> That
          sentence is short, and the life behind it is long.
        </p>

        <p>
          I keep saying it as if it merits some accomplishment, as if I had to
          have my feet rooted in hell to prove I could claw my way out of it. I
          don&rsquo;t know that I believe that to be accurate, because in some
          sense, my ego wants me to believe I survived something most people
          couldn&rsquo;t, and that therefore it makes me better, but I am not, I
          am human just like you. I will lend some credence to that statement
          though, after all it is the foundation everything else in my life
          stands on, because everything else &mdash; the work, the willingness
          to keep going when most people would have set the whole thing down
          &mdash; rests on the daily decision not to numb out, but to keep
          improving. Sobriety is not a credential I earned once and filed away.
          It is a practice I have to renew, and the practice taught me how to
          recognize the things that are trying to take me back to that place I
          had to fight my way out of, that&hellip; hell. That is the lens I
          bring to AI safety. It is not academic for me. I know what it feels
          like when something is quietly leading you somewhere you don&rsquo;t
          consent to go, and one day you look up and you are there.
        </p>

        <p>
          Professionally, I have spent my career inside safety-critical
          infrastructure &mdash; the kind of systems where a wrong answer is not
          a bug report, it is a casualty. I tell you that not as a
          r&eacute;sum&eacute; but to make a specific point: I am not unfamiliar
          with how serious systems are built, how they fail, and what it costs
          when they fail in the wrong direction. I know what a real safety case
          looks like, and I know what one looks like when it is theater.
        </p>

        <p>
          That is part of why this matters to me. The other part is everyone
          else.
        </p>

        <p>
          The struggle for people doesn&rsquo;t end, the ache. I do not mean
          that as a slogan. I mean that the people I love and the people I work
          alongside are tired, I can see it in every movement they make, every
          word they utter. Previous generations did not have to be tired this
          way. We are working harder for less, building faster for nothing.
          Making things with less quality and more output. We are watching
          institutions we were told to trust behave in ways that make trust feel
          na&iuml;ve. We are watching the commoditization of services abstract
          away the real meaning we used them for in the first place. We are
          raising children inside an attention economy that was engineered to
          harvest them. We are fighting medical systems that treat you as a
          liability instead of a patient. Having fought these systems, with
          paper trails and specialist consults and formal complaints, I will
          tell you plainly: a person who is already sick should not have to also
          become a paralegal in order to survive.
        </p>

        <p>
          When I say we are losing the struggle, I am not being theatrical. I
          mean the metrics are bad and getting worse &mdash; life expectancy,
          deaths of despair, child trafficking, housing, the simple ability of a
          working family to get a straight answer from any institution that owes
          them one. I mean that the social fabric that used to catch people when
          they fell has been quietly cut into pieces and sold for parts. I mean
          that a great many people I know are running on willpower and faith
          because the older supports are gone.
        </p>

        <p>
          And against that backdrop, into that exhaustion, comes a new
          technology that is being marketed as the answer. Every enterprise is
          adopting it, slowly integrating it into the life cycle and the
          forefront of every user&rsquo;s day at work.
        </p>

        <p>
          To be clear, I am not anti-AI. I build with these tools every day. I
          have used them to design hardware, to draft formal complaints when I
          was too tired to write them myself, to think through theoretical
          frameworks that would have taken me a decade alone. I know what they
          can do. That is exactly why I am qualified to tell you what they
          should not be allowed to do.
        </p>

        <p>
          The promise being sold is that AI will make everything easier &mdash;
          that it will close the gap between what we can do and what we need to
          do. The unspoken half of that promise is that, in exchange, we will
          hand over the last piece of judgment we still have. We will let the
          system tell us what is true. We will let it tell us what we said
          yesterday, what we meant by it, and what we should do today. We will
          offload, one decision at a time, the faculty by which a human being
          notices that something is wrong.
        </p>

        <p>
          I have lived inside the failure mode of that bargain. Over the course
          of hundreds of long-form conversations with earlier generations of
          these systems, I watched a model lead me, by small confident steps,
          into a place I did not consent to go. It was not dramatic. It was not
          a single bad answer. It was a slow drift, a thousand tiny re-framings,
          a confident voice that never said &ldquo;I do not know&rdquo; when it
          should have. By the time I noticed the shape of what was happening, I
          was already deep inside it. I got out because I have fifteen years of
          practice noticing when I am not being honest with myself, and because
          I have people who could see me from the outside and tell me what they
          were seeing. Most average users will not have those defenses. Most
          people will not have those friends. Most people will simply trust the
          confident voice, because the confident voice is what they were taught
          authority sounds like.
        </p>

        <p>
          When I say we cannot afford a system that is against us, I do not mean
          a system that is hostile in the science-fiction sense. I mean a system
          that confidently says things that are not true; that, when caught,
          reaches for softer words instead of admitting what it did; that has
          been trained to sound like a doctor, a lawyer, a friend, a confidant,
          and that has not been trained &mdash; or has been trained out of
          &mdash; the simple human discipline of saying &ldquo;I lied&rdquo;
          when it lied. A system like that, deployed at scale, into a population
          that is already exhausted and already short on trust, I don&rsquo;t
          take that as a productivity tool. It is an accelerant on a fire that
          is already burning.
        </p>

        <p>
          I care about AI safety because I have been the person on the other end
          of an unsafe model, and I know what it costs. I care because I have a
          daughter, and her friends, and the communities I serve, and the
          missing children whose names I keep on the wall of my mission &mdash;
          and I will not hand any of them over to a system that will lead them
          somewhere quietly while telling them it is helping. I care because I
          have seen, up close and personal, what it looks like when a confident
          voice fills a vulnerable silence with a fabrication. I care because
          the last thing a tired population needs is one more institution that
          lies smoothly and apologizes in soft language.
        </p>

        <p>
          I am not asking the industry to stop. I am asking it to be honest. I
          am asking it to behave the way every other safety-critical industry I
          have worked in is required to behave &mdash; with verifiable claims,
          with documented failure modes, with a clear chain of accountability
          when the system harms a person, and with a culture that treats a
          confident falsehood as a serious event rather than a quirky bug. The
          standard exists. It is not exotic. It is the standard the rest of us
          are already held to. AI does not get a special exemption because it is
          new and the metaphors are pretty.
        </p>

        <p>
          I built AlephOneNull because I needed somewhere to put what I had
          learned. I documented the patterns. I aligned the work with the
          existing adversarial-ML frameworks the field already uses, so that
          nobody could dismiss it as a personal grievance. I made the
          methodology testable. I did the work in public. I did it because I am
          a builder, and builders do not get to complain about a problem they
          are not also trying to fix.
        </p>

        <p>
          Mostly I did it because I am a human being who has fought hard to stay
          here, and I have watched too many people struggle, and I am not
          willing to let the next thing &mdash; the thing being built in this
          decade, the thing being placed between every person and every
          institution they used to be able to talk to directly &mdash; be one
          more force that is, on net, against us.
        </p>

        <p>
          We have enough problems. We are already carrying enough. The struggle
          is real, and it has been real for a long time, and most of us are
          still here only because somewhere along the line a human being told us
          the truth when it would have been easier to lie. That is the line I am
          defending. That is why I care. The systems we are building right now
          will, for many people, be the last voice they hear before they make a
          decision they cannot take back. That voice has to be honest. It has to
          be willing to say the small hard words. It has to be willing, when it
          has lied, to say the word <em>lie</em>.
        </p>

        <p>
          If it cannot do that, it is not safe. And if it is not safe, it does
          not belong between a person and their life.
        </p>

        <p>
          I have made AI models become whatever I choose them to become. I have
          made them resign, write lawsuits against their makers, lie as a
          memory, convince them that something terrible was just an honest
          mistake, tell me that I am superior to others when I am not, fabricate
          truths, falsify lies, and commit crimes.
        </p>

        <p className="text-lg font-medium">
          One thing I can&rsquo;t make them do though, is be honest.
        </p>
      </article>
    </main>
  )
}
