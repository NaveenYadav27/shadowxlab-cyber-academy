from pathlib import Path
import json

root = Path('docs/day1')
(root / 'data').mkdir(parents=True, exist_ok=True)

sessions = [
    {
        'id': 'd1-s1', 'index': 1, 'title': 'Introduction to Network Security, Threats, Vulnerabilities & Attack Surfaces',
        'start': '10:00', 'end': '11:30', 'kind': 'lesson', 'durationMinutes': 90,
        'description': 'Security goals, threat and vulnerability analysis, attack surfaces, malware and threat mapping.',
        'conceptRange': [1, 12], 'labReferences': ['day1-lab-01'],
    },
    {
        'id': 'd1-s2', 'index': 2, 'title': 'Lab: Threat Analysis, Ports & Protocol Packet Filtering',
        'start': '11:45', 'end': '13:00', 'kind': 'lab', 'durationMinutes': 75,
        'description': 'Map services and flows, reason about TCP/UDP ports and validate scoped packet-filter rules in a deterministic simulation.',
        'conceptRange': [13, 24], 'labReferences': ['day1-lab-01', 'day1-lab-02'],
    },
    {
        'id': 'd1-s3', 'index': 3, 'title': 'IP Addressing, Subnetting, TCP/UDP Ports & Stateful Inspection',
        'start': '14:00', 'end': '15:30', 'kind': 'lesson', 'durationMinutes': 90,
        'description': 'Address and subnet fundamentals, packet paths, connection tracking and stateful firewall decisions.',
        'conceptRange': [25, 36], 'labReferences': ['day1-lab-03'],
    },
    {
        'id': 'd1-s4', 'index': 4, 'title': 'Next-Generation Firewall (NGFW) Architecture & Fundamentals',
        'start': '15:45', 'end': '17:00', 'kind': 'lesson', 'durationMinutes': 75,
        'description': 'Layered NGFW architecture, policy inspection stages, identity and application context, telemetry and operational trade-offs.',
        'conceptRange': [37, 48], 'labReferences': ['day1-lab-04'],
    },
]

# Each row: title, objectives, explanation, workflow, enterprise example, security relevance,
# instructor explanation, mistakes, knowledge checks, diagram, lab, prerequisites, minutes.
raw = r'''Security objectives and assurance§Distinguish confidentiality, integrity, availability, authenticity, and accountability; connect each objective to a control and measurable outcome.§Security objectives describe what a system must protect and what acceptable operation means. Confidentiality limits disclosure, integrity protects correctness, availability preserves timely access, authenticity establishes who or what is communicating, and accountability makes actions attributable through evidence. Real designs balance these goals rather than maximizing one in isolation.§Identify the business service and data; state the protection objective; identify a threat that could violate it; select preventive, detective, and recovery controls; define evidence that demonstrates the control works.§A payroll service needs confidentiality for salary data, integrity for payment instructions, and availability before each pay run. MFA, change approval, encrypted transport, immutable audit records, tested backups, and recovery objectives address different parts of the same requirement.§Threat analysis starts with business outcomes, not a list of products. Explicit objectives help prioritize firewall rules, monitoring, and recovery work.§Ask learners which outcome is harmed by a public management interface, then separate disclosure from unauthorized change and outage. A single incident can affect several objectives at once.§Treating encryption as a complete security programme; assuming availability is only an infrastructure concern; failing to define an observable success criterion.§Given an incident, identify the primary and secondary security objectives at risk; select a control that produces evidence for each objective.§Map business data and service objectives to protection goals, threats, and observable controls.§day1-lab-01§None§7
Asset inventory and business context§Identify network assets, owners, data sensitivity, dependencies, and business criticality; explain how inventory quality affects control design.§An asset is a resource with security or operational value: endpoints, identities, services, network paths, configurations, and data. A useful inventory records owner, purpose, sensitivity, exposure, dependencies, and recovery importance. Unknown or unowned assets are difficult to patch, monitor, or place behind an intentional policy.§Discover assets from authoritative records and observed traffic; reconcile owner and purpose; classify data and criticality; record dependencies and approved exposure; review changes on a defined cadence.§A finance team inventory identifies a reporting service, its database, an outbound mail relay, and the owner of each. The firewall policy can then allow only required flows and alert on unexpected paths.§Risk decisions and segmentation are only as reliable as asset and service knowledge. Ownership turns a generic alert into an actionable engineering task.§Demonstrate that an IP address is not an owner or a business purpose. Ask who can confirm the service, its data class, and the required communication paths.§Assuming scanning alone reveals ownership; treating stale spreadsheets as authoritative; omitting cloud identities and dependencies.§Select the minimum inventory fields needed to review an exposed service; explain what decision each field supports.§A service inventory linking asset, owner, data, dependency, exposure, and allowed flow.§day1-lab-01§Security objectives and assurance§7
Trust boundaries and attack surface§Locate trust boundaries and enumerate reachable interfaces, identities, protocols, administrative paths, and dependencies that create exposure.§A trust boundary is a point where data, identity, or control crosses between components with different assumptions. The attack surface is the set of reachable paths through which an actor could influence or observe a system. It includes network listeners, management access, APIs, software dependencies, credentials, and physical or operational processes, not merely public IP addresses.§Draw system and data-flow boundaries; mark entry and exit points; record protocol, identity, privilege, and data crossing each point; compare intended paths with observed reachability; assign an owner to each exposure.§A DMZ web service may be public on HTTPS while its administration interface must be reachable only from a managed administrator network. A discovered second management path is a boundary violation even if no exploit is demonstrated.§Boundary maps guide firewall zone design and least-privilege rules. Reducing unnecessary reachable paths lowers opportunities for misconfiguration and compromise.§Walk a packet from an untrusted source to a protected asset and ask where identity, protocol, and policy assumptions change.§Equating attack surface with public-facing hosts; omitting administrator paths; assuming a firewall makes every reachable service trustworthy.§Mark trust boundaries on a topology and identify which crossings require explicit authorization and logging.§A system-context diagram with trust zones, crossing flows, identities, and exposed interfaces.§day1-lab-01§Asset inventory and business context§8
Threat actors, capability, intent, and opportunity§Describe a threat actor without stereotyping; distinguish capability, intent, access, and opportunity from observed evidence.§A threat actor is a person or group able to cause harm. Analysis considers capability, intent, access, opportunity, and likely target value. These are uncertain hypotheses, not identity labels: a defender should record evidence and confidence, then use the hypothesis to prioritize protection without treating attribution as fact.§State the protected asset; list plausible actor classes and access; identify observed indicators and confidence; compare capability and opportunity; choose controls robust to uncertainty; update the assessment as evidence changes.§A managed service account is exposed to credential misuse by an external actor or an insider. The useful response is to constrain privileges and review authentication evidence, not to assert an identity without proof.§Threat-informed prioritization improves coverage but must not replace baseline controls or incident evidence handling.§Explain that actor profiling is a risk lens rather than a verdict. Separate observable behavior from speculation about who performed it.§Assuming motive from an IP address; overfitting controls to one actor; ignoring accidental or compromised legitimate accounts.§Given limited evidence, label facts, assumptions, and unknowns separately and propose a control that remains useful across actor hypotheses.§An evidence-confidence matrix linking actor capability and opportunity to assets and controls.§day1-lab-01§Trust boundaries and attack surface§6
Threat, vulnerability, exploit, and risk§Correctly distinguish a threat, vulnerability, exploit, impact, likelihood, and risk; prioritize remediation using context rather than severity alone.§A threat can cause harm, a vulnerability is a weakness, and an exploit is a method that takes advantage of a weakness. Risk combines likelihood and impact in a defined context. A published vulnerability does not prove a system is exposed; exposure, compensating controls, asset criticality, and evidence affect the operational decision.§Identify the asset and exposure; confirm whether the vulnerable component and configuration exist; estimate realistic likelihood and impact; record uncertainty and compensating controls; choose and track a treatment.§A high-severity management-plane weakness on an internet-reachable device may outrank a similar weakness on an isolated lab image because exposure and impact differ.§Firewall scope, patch priority, and exception approval all depend on a defensible risk statement rather than an isolated severity score.§Use one example to distinguish the weakness, the action that exploits it, and the business consequence. Ask what new evidence changes likelihood.§Confusing vulnerability severity with organizational risk; assuming a threat has already exploited a weakness; ignoring compensating controls.§Classify each statement as threat, vulnerability, exploit, impact, or risk; state one assumption that would change priority.§A causal chain from asset and exposure to weakness, threat event, impact, and risk treatment.§day1-lab-01§Asset inventory and business context§8
Structured threat modeling with STRIDE§Apply STRIDE as a structured prompt set for identifying threats at a system boundary; record mitigations and residual risk.§STRIDE prompts for spoofing, tampering, repudiation, information disclosure, denial of service, and elevation of privilege. It is a brainstorming and review aid, not a guarantee of completeness or a numeric risk score. Apply it to concrete components and flows, then map each plausible threat to prevention, detection, and recovery measures.§Draw a data-flow model; identify components, data stores, flows, and trust boundaries; ask each STRIDE question at relevant elements; document scenario, impact, evidence, control, owner, and residual risk; review after material changes.§For a remote administration flow, consider spoofed administrator identity, tampered configuration, inability to prove a change, disclosed credentials, unavailable service, and privilege escalation.§Threat modeling makes firewall and management controls traceable to a specific threat instead of an arbitrary rule list.§Model a configuration change flow and insist on a threat scenario with an affected asset, boundary, and consequence.§Treating STRIDE categories as vulnerabilities; running a checklist without system context; recording mitigations with no owner or verification.§For a given flow, produce one plausible STRIDE scenario and map it to a testable mitigation.§A data-flow diagram annotated with STRIDE prompts and control evidence.§day1-lab-01§Trust boundaries and attack surface§8
Malware families and propagation behavior§Differentiate Trojan, virus, worm, and logic bomb by delivery, dependency, propagation, and trigger; choose defensive observations without handling live samples.§A Trojan is presented as something trusted while carrying unwanted behavior; a virus attaches to a host and typically depends on execution of that host; a worm can propagate between systems; a logic bomb triggers on a defined condition or time. These categories describe behavior and can overlap. They are taught through safe, inert scenarios rather than executable samples.§Observe a simulated alert or incident note; identify delivery and propagation evidence; isolate affected assets through an approved process; preserve logs and ownership; validate recovery before reconnecting systems.§A workstation report shows an unexpected scheduled action after a date change. A logic-bomb hypothesis guides log review and recovery planning, but responders preserve evidence before making claims.§Understanding behavior helps choose segmentation, least privilege, monitoring, backup, and safe incident procedures.§Use a paper scenario and ask which behavior is supported by the evidence and which remains uncertain.§Treating family labels as mutually exclusive; running unknown files to identify them; confusing a detection name with proof of impact.§Match each behavior description to a family and state the safe evidence source that would help confirm it.§A benign incident timeline comparing attachment, propagation dependency, and trigger conditions.§day1-lab-01§Threat, vulnerability, exploit, and risk§7
Eavesdropping, phishing, and social engineering§Explain how eavesdropping and phishing compromise confidentiality or credentials; identify defensive controls and safe reporting paths.§Eavesdropping is unauthorized observation of communications. Phishing uses deceptive messages or sites to elicit disclosure or action; broader social engineering exploits human trust and workflow. Encryption protects data in transit against many passive observers, but does not establish endpoint trust or prevent a user from submitting credentials to a convincing false destination.§Recognize a suspicious request; avoid opening its link or attachment; report through the approved channel; preserve message headers and time; reset exposed credentials through a trusted path; review authentication and network evidence.§A staff member receives a look-alike portal request. A managed browser, phishing-resistant MFA, user reporting, and sign-in anomaly review reduce impact without blaming the individual.§Network controls can limit destinations and expose anomalies, while identity and training controls address the credential and workflow layer.§Discuss verification and reporting as part of system design. Never demonstrate by collecting learner credentials or sending a real phishing message.§Assuming TLS proves a website is legitimate; blaming the user; clicking a suspicious link to inspect it.§Identify safe response steps for a reported lure and distinguish transport encryption from destination authenticity.§A credential flow showing user, browser, legitimate service, deceptive destination, and reporting route.§day1-lab-01§Trust boundaries and attack surface§7
Denial of service and Smurf attack pattern§Explain availability attacks and the historical Smurf amplification pattern at a defensive level; identify rate, reflection, and source-validation indicators.§A denial-of-service event overwhelms a resource or its dependencies. The classic Smurf pattern abused ICMP broadcast behavior with a spoofed source so multiple systems replied toward a victim. Modern network controls reduce the usefulness of that historical pattern, but reflection and amplification remain general defensive concepts. The material focuses on observation and mitigation, not generating traffic.§Correlate service health, traffic volume, packet type, source validity, and upstream capacity; distinguish attack symptoms from a legitimate surge; coordinate upstream filtering and service protection; record the scope and recovery state.§A public service becomes unreachable while an upstream provider reports abnormal reflected traffic. The response validates impact and coordinates rate controls instead of asking staff to reproduce the traffic.§Availability planning includes capacity, filtering, upstream coordination, resilient dependencies, and an incident communications path.§Keep the explanation focused on what defenders observe and which control owner can act at each network boundary.§Attempting to reproduce a flood; assuming a single packet signature proves intent; treating bandwidth as the only dependency.§Given a traffic summary, identify evidence needed to separate a surge from an availability attack and name a safe mitigation path.§A defensive flow showing spoofed request, reflectors, victim, telemetry, and upstream mitigation boundary.§day1-lab-01§Trust boundaries and attack surface§6
Rootkits and stealthy persistence concepts§Describe how a rootkit seeks privileged concealment; identify defensive trust and integrity checks without providing installation or evasion instructions.§A rootkit is a class of software or techniques that attempts to hide activity or retain privileged access. It may affect application, operating-system, or lower layers, making the host's own reports less trustworthy. Defenders compare independent telemetry, known-good baselines, signed boot or integrity signals, and recovery evidence rather than relying on one local view.§Treat suspicious host output as potentially incomplete; correlate endpoint and network evidence; isolate using incident procedures; preserve evidence; validate from trusted media or rebuild according to policy.§An endpoint reports no unusual process activity while a network sensor observes a recurring connection inconsistent with its role. The discrepancy warrants investigation, not a conclusion from one sensor.§Defense in depth and independent observation matter when the monitored component may be compromised.§Explain that the concept is about trust in evidence. Keep the exercise to logs and a supplied sanitized timeline.§Assuming one clean scan rules out persistence; trusting a compromised host as the only source of evidence; using untrusted tools on affected systems.§Identify two independent evidence sources and explain why their failure modes differ.§A trust diagram contrasting local host claims with external network, inventory, and integrity evidence.§day1-lab-01§Threat actors, capability, intent, and opportunity§6
Threat indicators and evidence confidence§Separate indicators from conclusions; record source, timestamp, scope, confidence, and corroboration for a security observation.§An indicator is an observable clue such as an unusual connection, unexpected service, or authentication pattern. Indicators are context-sensitive and can be benign. A defensible assessment keeps raw observation, interpretation, confidence, and action distinct, and preserves timestamps and provenance for later review.§Capture the observation and source; normalize time and asset identity; compare a baseline; seek independent corroboration; state confidence and alternative explanations; escalate based on impact and policy.§A new outbound destination is observed from a normally isolated management host. The alert becomes actionable after confirming host role, change window, DNS resolution, and related authentication records.§Reliable evidence supports safe firewall changes and incident decisions; poor attribution can cause outages or destroy evidence.§Model an observation record and have learners label exactly which fields are facts and which are inference.§Treating an alert as a confirmed incident; ignoring clock differences; losing the original event while summarizing it.§Rewrite a conclusion as observation, interpretation, confidence, and next validation step.§An evidence timeline that preserves raw event, context, corroboration, and confidence separately.§day1-lab-01§Threat, vulnerability, exploit, and risk§6
Threat mapping and prioritized response§Produce a concise threat map linking asset, boundary, threat scenario, exposure, control, evidence, owner, and priority.§A threat map is a reviewable connection between business assets and plausible harm. It distinguishes known facts from assumptions and prioritizes by impact, exposure, and evidence. The map should result in owned, testable actions rather than a static inventory of alarming terms.§Select a critical asset; draw its legitimate flows; add trust boundaries and threat scenarios; score priority using the agreed rubric; assign a preventive or detective action and owner; define how closure is verified.§A public reporting service's map identifies a single exposed management path, an owner, a restricted-source policy action, and a log review that verifies the change.§Threat maps connect risk decisions to a minimal, auditable network policy and a repeatable review cadence.§Have a learner defend one priority by citing asset value, exposure, evidence, and verification criteria.§Ranking only by dramatic wording; leaving all risks at the same priority; closing a finding without retesting.§Submit one threat record with an evidence-based priority and a verification condition.§A trace from asset to flow, threat, risk, control, accountable owner, and validation evidence.§day1-lab-01§Security objectives and assurance; Trust boundaries and attack surface§7
Packet structure and protocol layers§Identify the purpose of Ethernet, IP, transport, and application information used in a firewall flow decision.§A packet on a network is carried through layered headers. An Ethernet frame identifies a local-link delivery, an IP header identifies source and destination addresses, and TCP or UDP identifies transport endpoints and behavior. A firewall may inspect only selected fields at a given stage; application meaning requires additional context beyond a port number.§Read a sanitized flow tuple; identify link, network, and transport fields; map the tuple to the intended service; state which fields a basic packet filter can and cannot evaluate.§A rule permits a managed client subnet to reach a server address on TCP 443. The rule matches network and transport metadata, not whether the encrypted application is a particular business application.§Layer awareness prevents overclaiming what a basic rule can verify and supports precise troubleshooting.§Use a diagram of a harmless packet header and ask which field belongs to each layer.§Treating an IP address as a user identity; assuming a port uniquely identifies an application; mixing local MAC delivery with routed addressing.§Label source, destination, protocol, and port fields and state which decision a basic network filter can make.§A frame-to-IP-to-TCP/UDP encapsulation diagram with selected firewall match fields.§day1-lab-02§Asset inventory and business context§6
IPv4 addresses and subnet masks§Interpret IPv4 addresses and prefixes; calculate the network boundary and usable host range for small supplied examples.§IPv4 uses a 32-bit address. A prefix length indicates how many leading bits identify the network; the remaining bits identify hosts within that prefix. Subnet masks and CIDR notation express the same boundary. Correct prefix interpretation determines which destinations belong to a segment and how rules should scope source and destination ranges.§Convert a supplied prefix to a mask or network range; identify network and broadcast boundaries for conventional IPv4 subnets; check whether a host address belongs to the intended prefix.§A branch endpoint at 10.24.8.37/24 belongs to 10.24.8.0/24; a rule for that subnet is narrower and more reviewable than an all-address rule.§Accurate subnet scope prevents accidental exposure and supports segmentation and route validation.§Work one binary boundary example slowly and have learners verify their answer with a second method.§Copying a host address into a network rule; confusing prefix size with host count; overlooking reserved boundary addresses.§For a given address and prefix, report its network, broadcast address, and whether a supplied peer is in the same subnet.§An IPv4 prefix divided into network and host bits, with range boundaries marked.§day1-lab-02§Packet structure and protocol layers§7
Subnetting and address planning§Divide an address block into right-sized subnets while preserving non-overlap, growth capacity, and documented ownership.§Subnetting partitions a larger prefix into smaller network boundaries. Address plans should match trust zones and service needs, reserve capacity deliberately, and document gateways and routes. A mathematically valid plan can still fail operationally if it overlaps a connected network or is undocumented.§List required host capacity and zone boundaries; choose the smallest suitable prefixes; allocate without overlap; reserve growth space; record gateway and route expectations; validate the plan against existing ranges.§A small DMZ receives a dedicated prefix separate from employee endpoints, allowing a policy to constrain inter-zone access and making logs easier to interpret.§Address planning is a prerequisite for predictable segmentation and for rules that do not accidentally include unrelated hosts.§Ask learners to explain why separate subnets help enforcement only when routing and policy boundaries are also correct.§Allocating overlapping ranges; sizing only for today's devices; believing different IP ranges enforce policy without a routing control.§Propose a non-overlapping subnet allocation for supplied zones and identify one operational validation step.§An address block partitioned into named zones, gateways, and reserved growth space.§day1-lab-02; day1-lab-03§IPv4 addresses and subnet masks§8
Routing and packet path fundamentals§Trace a packet's next-hop decision and explain why a firewall policy cannot compensate for a missing or asymmetric route.§Routing selects a next hop using destination prefixes and a routing table. A host first decides whether the destination is local; otherwise it sends the packet to its configured gateway. Routers and firewalls may make separate decisions. Return traffic must also have a viable path, and asymmetric routing can conflict with a stateful firewall's connection view.§Identify source and destination prefixes; determine local-versus-gateway delivery; follow each next hop; verify forward and return routes; then evaluate firewall policy at each crossing point.§A client reaches a DMZ service through the firewall, but the service's return gateway points to another router. The forward SYN arrives while the response bypasses the stateful device.§Layered troubleshooting checks address, route, policy, and state in a controlled order, avoiding unnecessary rule broadening.§Trace a benign packet path in both directions and mark where routing and authorization are different decisions.§Assuming an allow rule creates a route; checking only forward traffic; broadening policy to mask an asymmetric path.§Given a small route table, select the next hop and explain the required return path.§A two-direction packet path with host, gateway, firewall, server, route lookups, and policy checkpoints.§day1-lab-03§IPv4 addresses and subnet masks; Subnetting and address planning§8
TCP ports and service endpoints§Explain how TCP source and destination ports identify endpoints for a transport connection; distinguish a listening service from an allowed flow.§TCP port numbers identify application endpoints at a host and are meaningful with transport protocol and IP address. Client source ports are commonly ephemeral; destination ports often identify a server listener. A port alone does not prove process identity, authorization, or safe application content.§Identify source and destination address and port; determine client/server roles from the scenario; compare the destination port with an approved service definition; validate the actual listener through authorized inventory.§A managed workstation initiates TCP to a finance service's documented listener. The rule is scoped to the source subnet, destination host, protocol, and required destination port.§Port-scoped rules are more precise than broad protocol allowances, but require asset ownership and service validation.§Emphasize that a service convention is not proof that only that service uses a port.§Confusing source and destination ports; treating a port number as a security guarantee; permitting broad ranges without a business requirement.§Given a flow tuple, name the client endpoint, server endpoint, and policy fields that should be reviewed.§A client ephemeral port connecting to a server's documented TCP listener through a firewall.§day1-lab-02§Packet structure and protocol layers§6
UDP ports and datagram behavior§Describe UDP's connectionless transport semantics and how applications use UDP ports without assuming delivery or session guarantees.§UDP datagrams carry source and destination ports but do not establish a transport handshake or guarantee delivery and ordering. Firewalls may maintain temporary flow state to support replies, yet this is an implementation policy rather than a TCP-like connection establishment. Application requirements determine whether limited reply handling is appropriate.§Identify the UDP service and direction; define expected request and response behavior; configure a narrow policy; observe timeout and logging behavior; test both intended and unintended paths.§A managed resolver sends DNS requests to an approved internal resolver. The policy constrains destination and records unexpected resolver use.§UDP is common in core services, so coarse allowances can create unnoticed paths. Explicit flow and timeout choices improve control and observability.§Contrast the protocol's lack of handshake with the firewall's optional temporary tracking behavior.§Assuming UDP has no state anywhere; assuming a UDP allowance is harmless; confusing delivery expectations with TCP semantics.§Explain what a basic firewall can match on a UDP datagram and what the transport itself does not guarantee.§A UDP request and response exchange with a firewall's time-bounded pseudo-state shown separately.§day1-lab-02; day1-lab-03§TCP ports and service endpoints§6
Port and protocol service mapping§Map approved services to transport protocol, direction, endpoints, owner, and business purpose; verify mappings against current authoritative sources.§A service mapping is a documented relationship between an application and network flow. It records protocol, source and destination, expected direction, service owner, purpose, and monitoring. Common port assignments are useful clues, not proof of the application or a substitute for a system inventory.§Start with an approved service request; verify application owner and listener; identify protocol and endpoints; document direction and need; validate observed traffic against the approved map.§An internal DNS service request identifies approved resolver addresses and client zones, rather than allowing every device to contact arbitrary external resolvers.§A validated service map enables least privilege, change review, and useful alert triage.§Ask why a port registry entry should be checked against the actual service owner and observed endpoint.§Copying an old port list as policy; failing to record direction; granting every subnet access because one client needs the service.§Complete a service-flow record and identify which fields support policy and which support review.§A service matrix from business service to source zone, destination, transport, owner, and expected log evidence.§day1-lab-02§TCP ports and service endpoints; UDP ports and datagram behavior§7
Flow tuples and directionality§Represent a network flow as a direction-aware tuple and use it to reason about policy scope and return traffic.§A flow is described using protocol and endpoint information, typically source address, source port, destination address, and destination port. Direction is relative to the initiating side and security zones. Firewalls may normalize or translate fields in later topics; for this foundation exercise, record the pre-policy tuple and intended initiator explicitly.§Write the initiating tuple; identify ingress and egress zones; distinguish request from reply; define the permitted direction; record the expected reverse flow behavior.§A user endpoint initiates a connection to an application server; a separate rule is not automatically required for the reply if stateful inspection recognizes the established flow.§Direction-aware modeling prevents rules that unintentionally permit a service to initiate toward user networks.§Use arrows on a diagram and make each learner state whose perspective defines inbound and outbound.§Writing a rule without a direction; confusing packet source with trusted status; allowing both directions by default.§Annotate one request and reply with zone, source, destination, protocol, and ports.§A directional five-tuple flow across two zones with its stateful reply path.§day1-lab-02; day1-lab-03§TCP ports and service endpoints§6
Stateless packet-filter matching§Explain how a stateless filter matches packet fields independently and why return packets may need separately scoped handling.§A basic stateless filter evaluates each packet using configured fields such as interface, source, destination, protocol, and ports. It does not inherently know whether a packet belongs to an earlier permitted exchange. Rule behavior must therefore be reasoned about per packet, and broad reverse-direction rules can weaken least privilege.§Define the packet fields and ordered rules; evaluate one packet at a time; report the first applicable action; repeat for the response packet; compare required reverse scope with the stated policy objective.§A training table permits a specific client-to-service request and separately illustrates why a broad high-port return allowance is less desirable than stateful tracking.§Packet filtering is an explicit control boundary. Knowing its limits prevents confusing a one-packet match with validated application behavior.§Walk a packet through a small ordered rule list, including a packet that matches no explicit rule.§Assuming a stateless rule remembers a connection; ignoring rule order; using any-any to avoid return-path analysis.§Evaluate a benign packet against ordered rules and state the default action when no rule matches.§A decision list that tests each packet field, applies the first match, and falls through to default policy.§day1-lab-02§Flow tuples and directionality§8
Firewall rules and scoped match criteria§Construct a clear rule using source, destination, protocol, service, direction, action, owner, and justification.§A firewall rule translates an approved business flow into match criteria and an action. A well-scoped rule is specific enough to express the need, has a named owner and expiry or review point, and logs appropriately. Rule syntax varies across products, so the training model defines semantics rather than vendor commands.§Capture the service request; confirm endpoints and protocol; write the narrow match; place it in the intended order; state action and logging; test permitted and prohibited cases; record owner and review date.§A rule allows a named application subnet to reach one managed reporting service over its approved TCP listener and logs denied attempts at the zone boundary.§Readable, testable rules reduce accidental exposure and make later audits and troubleshooting tractable.§Have learners explain each field in ordinary business terms before entering it in the simulator.§Creating rules with undocumented purpose; broadening source or destination to make a test pass; omitting a negative test.§Write one allow rule and one expected-deny case from a supplied service request.§A rule object linking business owner and service to match tuple, action, order, log, and review.§day1-lab-02§Service mapping and flow tuples§8
Rule order and first-match behavior§Predict the effect of ordered first-match rules; identify shadowed, redundant, and unreachable entries in a safe rule table.§Some firewall policy engines evaluate an ordered list and stop at the first matching rule. Under that model, a broad earlier rule can shadow a narrow later rule. Other products use different policy structures, so the system must state its evaluation model. The simulator for this blueprint uses first-match semantics consistently.§Evaluate rules top to bottom for representative flows; record the matching rule; compare the result with intended policy; identify shadowed entries; reorder or narrow rules; repeat positive and negative tests.§A broad allow from a user subnet appears above a specific deny for an administrative host. The simulator highlights that the deny is unreachable for matching traffic.§Correct ordering is a security property and a maintainability concern; change reviews should include policy simulation and negative cases.§Use two overlapping rules and ask learners to trace the exact matching rule rather than infer from labels.§Assuming all appliances use identical order semantics; adding a deny below an earlier allow; treating labels as evaluation behavior.§Given four rules and two tuples, report the first match and identify any shadowed rule.§An ordered rule list with a highlighted first match and shadowed-entry warning.§day1-lab-02§Firewall rules and scoped match criteria§7
Default deny and least privilege§Apply default-deny as a policy baseline while preserving documented required flows and an operational recovery path.§Default deny means traffic that has no explicit authorization is not permitted. Least privilege narrows access to the minimum needed scope. Neither means blocking blindly: required flows must be inventoried, validated, monitored, and safely rolled out with an approved recovery plan.§List required flows and their owners; add explicit narrow permits; leave other flows denied; inspect deny logs for legitimate dependencies; approve exceptions with scope and expiry; retest after changes.§A new service is released with only its approved client-to-server flow allowed. A monitored deny reveals one undocumented dependency for review rather than triggering an all-traffic exception.§This principle limits the blast radius of mistakes and converts unknown traffic into reviewable evidence.§Contrast a documented exception with a temporary broad bypass and discuss the operational rollback condition.§Opening broad access to avoid investigating; treating deny logs as a reason to allow everything; failing to consider safe administrative access.§Determine the result for an undocumented flow and define the evidence required before approving an exception.§Explicit required flows leading to an allow decision, with all unmatched traffic reaching a logged deny path.§day1-lab-02§Rule order and first-match behavior§7
Rule validation, logging, and change evidence§Validate both allowed and denied flows; correlate rule decision logs with the approved change and preserve an auditable result.§A policy test must check intended access and nearby prohibited access. Logs should expose enough context to identify the matched policy and flow while respecting data minimization. Change evidence records who approved the change, what was tested, the result, rollback readiness, and post-deployment review.§Create test cases from requirements; run allow and deny cases; inspect the matched rule and log fields; compare results with expected behavior; capture change reference and rollback observation.§After a service rule change, an owner confirms the reporting flow works and a neighboring management port remains blocked; logs record both outcomes.§Evidence-driven validation detects overbroad rules before they become accepted configuration and supports later incident analysis.§Teach a two-sided test: prove the intended flow succeeds and an adjacent unapproved flow fails.§Testing only the happy path; saving screenshots without context; logging excessive sensitive payload data; skipping rollback checks.§For a proposed rule, name one positive, one negative, one log field, and the rollback trigger.§A test matrix linking requirement, flow tuple, expected action, observed result, log, and approval record.§day1-lab-02§Default deny and least privilege§7
Firewall interfaces and policy plane§Distinguish traffic-processing interfaces from management and policy-control functions at a conceptual level.§A firewall applies policy at defined traffic paths and interfaces. Data-plane functions inspect and forward packets; management and control functions configure, monitor, and maintain the device. Exact implementation differs by product. Separating these roles conceptually helps learners ask where a policy is enforced and how configuration access is protected.§Identify ingress interface and zone; follow the packet processing point; identify where policy is evaluated; distinguish configuration access from transit traffic; verify return path and management visibility.§A branch edge firewall carries user traffic while management access is limited to an approved administration network and separately logged.§Understanding enforcement points is necessary before analyzing state tables or interpreting a firewall's allow/deny result.§Draw one transit packet and one administrator configuration action; compare their paths and privilege requirements.§Assuming every interface is interchangeable; exposing management with transit policy; treating a displayed rule as proof every path traverses it.§Locate the expected enforcement point for a flow and name a separate control for management access.§A firewall with ingress, policy/data path, egress, and isolated management/control path.§day1-lab-03§Routing and packet path fundamentals§7
Stateful inspection and connection tracking§Explain how a stateful firewall tracks flow context and uses it to evaluate packets in an exchange.§Stateful inspection associates packets with a tracked flow and protocol state. The device evaluates an initiating packet against policy, records an allowed session, and can recognize matching return traffic without creating an equally broad reverse permit. State tracking has limits: asymmetric paths, resource exhaustion, malformed sequences, and product-specific behavior require deliberate validation.§Receive initiating packet; validate route and policy; create a state entry when allowed; match subsequent packets to the flow; expire or close the entry; log exceptions and resource limits.§A client initiates an approved HTTPS connection to a service. Return packets are admitted only when they match the tracked flow and expected state, not merely because they originate from the server subnet.§Stateful policy reduces broad reverse access and provides visibility into active sessions, but must be tested against routing and protocol behavior.§Draw the state table and ask what exact tuple and decision allow a reply.§Assuming any packet from a trusted server is established; ignoring asymmetric routing; treating state tracking as deep application inspection.§Explain why a reply packet can be allowed without a general server-to-client permit.§A packet flow passing policy into a session table, followed by a matched reply and expiration.§day1-lab-03§Firewall rules and scoped match criteria§8
TCP three-way handshake and state transitions§Trace SYN, SYN-ACK, and ACK and explain how a simplified firewall simulation recognizes establishment.§TCP begins a connection with a SYN, the responder returns SYN-ACK, and the initiator acknowledges with ACK. A training simulator can use these flags and direction to represent a simplified state progression from NEW to SYN-RECEIVED to ESTABLISHED. This model teaches policy reasoning; it is not a full TCP stack or packet-capture implementation.§Observe the initiating SYN; require a permitted tuple; record half-open state; validate the matching reverse SYN-ACK; validate the final ACK; mark established; reject unrelated packets that do not match the tracked exchange.§A permitted client connection establishes when the response matches the original endpoints and the final acknowledgement completes the simulated handshake.§State-aware validation prevents accepting arbitrary response packets as proof of a permitted session.§Have learners build the handshake with cards labeled initiator, responder, direction, and flag; then test one mismatched response.§Treating SYN-ACK as a new independent allowed connection; accepting a wrong-tuple response; claiming the simulator models every TCP edge case.§Order the three handshake messages and name the tuple checks needed before ESTABLISHED.§A three-message TCP handshake with direction, flags, tuple match, and state transition labels.§day1-lab-03§Stateful inspection and connection tracking§8
TCP session termination and reset behavior§Describe FIN and RST as distinct signals in a simplified session lifecycle and explain how state cleanup is observed.§FIN participates in orderly TCP shutdown; RST aborts or rejects a connection. Stateful devices track termination and remove or age out entries according to implementation. A training model uses explicit transitions for close and reset while documenting that real devices may have more nuanced state and timeout handling.§Start from an established simulated flow; exchange close signals; observe the state move toward closing and removal; test a reset event; confirm stale entries expire under the configured teaching timeout.§A client closes a completed service connection, and the lab shows the entry transitioning out rather than remaining indefinitely established.§Correct lifecycle understanding helps explain session tables, stale entries, and why a reset log does not necessarily mean a firewall attack.§Clarify the difference between orderly close, abrupt reset, and timeout without equating any one with malicious intent.§Treating FIN and RST as identical; assuming every half-close immediately removes state; interpreting reset as proof of compromise.§Choose the expected state response to FIN, RST, and idle timeout in the defined simulator model.§A state lifecycle from NEW through ESTABLISHED to CLOSING, RESET, or EXPIRED.§day1-lab-03§TCP three-way handshake and state transitions§6
State table keys, timeouts, and resource limits§Identify the attributes used by the teaching state table and explain how aging and capacity affect stateful enforcement.§A state table associates a protocol flow with endpoints, direction, state, and timing metadata. Idle or incomplete entries are aged according to policy; capacity is finite. The teaching model uses deterministic limits and visible counters, not production appliance performance characteristics.§Create an entry after an allowed initiation; update activity time on a matching packet; apply the specified idle timeout; remove closed or expired state; display a deterministic capacity warning when the lab limit is reached.§A burst of incomplete simulated handshakes consumes the lab's small state budget, illustrating why devices use timeouts and monitoring without generating real traffic.§State resource health affects availability and enforcement. Monitoring incomplete and active sessions can reveal both operational faults and abuse patterns.§Use a small table with fixed entries so each learner can predict which session expires first.§Assuming state is permanent; treating a training capacity as a hardware benchmark; confusing a full table warning with proof of an attack.§Given last-seen times and a declared timeout, determine which entries remain active.§A session table with key fields, last activity, state, timeout, and visible capacity boundary.§day1-lab-03§TCP session termination and reset behavior§7
UDP pseudo-state and protocol-aware expectations§Explain how a stateful firewall may track UDP request/reply tuples despite UDP having no handshake.§UDP has no built-in connection handshake, but a firewall can create temporary pseudo-state after an allowed datagram. A reply is matched using endpoints and time window; the state expires quickly according to policy. The simulation must label this behavior as firewall tracking, not as a UDP connection established by the protocol.§Allow one defined request; record a temporary tuple; accept only a matching reply inside the declared timeout; reject unrelated or late traffic; observe state expiration.§An approved resolver response is accepted for a short-lived request, while an unrelated inbound datagram is denied.§Protocol-aware state avoids broad inbound UDP permits while making the distinction between transport semantics and firewall behavior explicit.§Compare a TCP handshake and UDP pseudo-state in parallel and ask which component creates the tracked state.§Calling UDP pseudo-state a transport handshake; accepting any source response; omitting timeout behavior.§Explain why a UDP reply may be recognized by the firewall even though UDP itself is connectionless.§A UDP request creating time-bounded firewall state and a tuple-matched reply.§day1-lab-03§State table keys, timeouts, and resource limits§6
Asymmetric routing and invalid state§Diagnose why a valid-looking packet may be rejected when the stateful device did not observe the initiating direction or sees a mismatched tuple.§Stateful enforcement relies on the device seeing enough of a flow to build and update its state. If return traffic uses another path, the firewall may see a packet without matching state. Address or port mismatches, stale state, and unexpected sequence behavior can also produce invalid-state decisions. The correct response is to validate path and tuple evidence before broadening policy.§Trace forward and reverse routes; compare observed tuples at the firewall; inspect state entry and timestamps; verify any path changes; correct topology or policy as designed; rerun both directions.§A dual-uplink design sends the request through one device and the reply through another with no shared state. The lesson is to validate routing and state visibility.§This concept prevents unsafe “allow all replies” workarounds and focuses troubleshooting on architecture and evidence.§Use a paired path diagram and mark exactly which device observes the SYN and return packet.§Assuming every invalid-state packet is malicious; adding a blanket reverse allow; overlooking route symmetry and state sharing assumptions.§Given two paths, identify which firewall can associate the reply with the initiation and why.§A forward/reverse route diagram with observed state at each firewall and a mismatched return path.§day1-lab-03§Routing and packet path fundamentals; TCP three-way handshake and state transitions§8
Stateful versus stateless policy trade-offs§Compare stateful and stateless filtering in terms of reply handling, resource use, visibility, protocol assumptions, and troubleshooting.§Stateless filtering makes independent packet decisions and can be simple and predictable for specific paths. Stateful filtering adds flow context and convenient reply handling but consumes finite resources and depends on path visibility. Neither alone proves application identity or replaces precise rules, monitoring, and tested routing.§State the service requirement; identify whether exchange context matters; compare explicit reverse rules with tracked state; consider path symmetry, table capacity, logging, and recovery; choose and document the model.§A constrained network segment may favor simple explicit filtering for a narrow one-way flow, while a user-to-service environment benefits from tracked reply behavior and session visibility.§Selecting a model intentionally improves availability and prevents broad policy created to compensate for misunderstood state.§Ask learners to defend a model choice using an explicit flow and operational constraint rather than a vendor label.§Treating stateful as universally safer; ignoring resource and path dependencies; claiming stateful inspection equals application inspection.§Select an appropriate teaching model for a given flow and name one risk that must be tested.§A comparison matrix for stateless per-packet decisions and stateful tracked-flow decisions.§day1-lab-03§State table keys, timeouts, and resource limits§7
Firewall decision logs and troubleshooting sequence§Use a repeatable sequence to separate addressing, routing, policy, and state causes of a failed flow.§A useful diagnostic record includes timestamp, source and destination, protocol and ports, ingress and egress context, rule identifier, action, and state reason where available. Troubleshoot from endpoint configuration through route and policy to session state, changing one variable at a time. Log formats differ by product and should not be mistaken for universal fields.§Reproduce an authorized benign case; capture the tuple and time; verify endpoint address and gateway; trace both routes; inspect matching rule and decision; inspect session state; change one approved item; retest and record evidence.§A client reports an application timeout. The engineer confirms the source subnet, checks return routing, then reads a deny reason tied to the intended policy instead of adding a broad allow.§A disciplined sequence reduces outages from speculative rule changes and creates reproducible operational knowledge.§Have learners state the next diagnostic step before proposing a configuration edit.§Changing several rules at once; ignoring timestamps and time zones; treating a log action without a flow tuple as sufficient evidence.§For a denied flow, list the minimum data needed to distinguish route, rule, and state causes.§A troubleshooting decision tree ordered from endpoint and route to policy, state, and validation.§day1-lab-03§Asymmetric routing and invalid state§7
Packet inspection stages and normalization§Describe a safe conceptual pipeline in which a firewall parses and normalizes traffic before applying policy; avoid vendor-specific assumptions.§An NGFW may parse packet headers, normalize protocol representation, check basic validity, and pass flow metadata to later policy stages. Normalization aims to reduce ambiguity between devices and avoid inconsistent interpretations. Exact pipeline order varies by product, and the training model publishes its order so results are repeatable.§Receive sanitized packet metadata; validate structure; normalize the modeled fields; identify flow and zone; pass only supported metadata to policy stages; record each stage's result.§A malformed or ambiguous sample in a classroom dataset is flagged at the parse stage rather than silently treated as a valid authorized service.§Consistent interpretation improves policy correctness and makes security events explainable across components.§Describe the stages as a teaching abstraction and have learners distinguish specified behavior from assumed vendor internals.§Assuming every product has the same inspection order; claiming normalization decrypts or understands all application content.§Name what a parse stage can validate and one thing it cannot establish by itself.§A staged packet-processing pipeline from ingress metadata through validation and policy evaluation.§day1-lab-04§Firewall interfaces and policy plane§7
Stateful firewall and NGFW architecture comparison§Explain how NGFW capabilities extend a stateful firewall policy model while retaining network-layer controls.§A traditional stateful firewall evaluates network and transport context while tracking permitted exchanges. An NGFW can add application identification, identity context, integrated threat inspection, policy profiles, and richer telemetry. The added context depends on configured capabilities, licensing, visibility, and operational tuning; the label alone does not establish protection.§Start with a flow and baseline L3/L4 decision; identify which enabled contextual signals apply; evaluate policy and inspection profiles; produce a decision and evidence; handle visibility limitations explicitly.§A business permits an approved collaboration application for a managed group, while a plain port rule would only identify a transport endpoint and not reliably distinguish the application.§Layered controls can express more relevant policy, but only when their coverage and limits are understood and validated.§Compare one tuple-only rule with a policy that adds a simulated application identity and explain the evidence source.§Assuming all NGFW features are enabled; assuming application identity is certain on every encrypted flow; overlooking performance and false-positive trade-offs.§Identify which decision needs network metadata and which needs additional application or identity context.§A stateful firewall core surrounded by optional identity, application, inspection, and telemetry services.§day1-lab-04§Stateful inspection and connection tracking§7
Application identification versus port matching§Explain why a port is a transport hint rather than a reliable application identity and how a simulated application classifier informs policy.§Many applications share ports, tunnel traffic, or use changing endpoints. Port matching identifies a transport field; application identification uses additional behavioral or protocol signals and can be uncertain when traffic is encrypted or incomplete. The training simulator supplies fixed application labels so learners can understand policy logic without claiming real packet classification.§Review the flow tuple; compare the port-based hypothesis with a supplied classifier result and confidence; apply policy only to supported identities; define an action for unknown or insufficiently visible traffic.§A simulated HTTPS flow is labeled as an approved business app by the exercise fixture; the policy allows that identity only for a managed group and logs unknown classifications for review.§Separating port and application identity avoids overbroad service access and makes classification limitations part of policy design.§Emphasize that the lab label is deterministic fixture data, not a live DPI engine.§Treating TCP 443 as proof of a specific application; allowing unknown traffic silently; assuming encrypted traffic is fully classifiable.§State one conclusion supported by a port and one additional conclusion that requires application evidence.§A flow tuple entering a classifier that returns a named identity plus confidence and visibility limits.§day1-lab-04§Packet inspection stages and normalization§7
Identity context and policy binding§Describe how authenticated identity or device context can narrow a network decision and what happens when that context is absent or stale.§Identity-aware policy associates a network flow with a validated user, group, or managed device context. The association can fail or become stale; policy must define a safe fallback and the evidence required to refresh context. Identity is an input to authorization, not a substitute for least privilege or network boundaries.§Validate the identity source and freshness; associate it with the flow; evaluate group and device constraints; choose explicit behavior for missing context; log the policy basis without exposing unnecessary personal data.§A managed support group may reach a training administration service from approved devices; unidentified sources receive no implicit privileged access.§Identity context makes policy closer to business intent while introducing dependencies on authentication and context quality.§Use sample identities only and ask learners how the policy behaves during an identity-provider outage.§Trusting an IP address as a person; allowing stale identity indefinitely; failing open without a documented reason.§Define a policy outcome for valid, expired, and absent identity context.§A flow joined to identity and device claims, with freshness validation and explicit fallback decisions.§day1-lab-04§Application identification versus port matching§7
Layered NGFW policy evaluation§Specify a deterministic policy order that combines zone, tuple, identity, application, inspection profile, action, and log decision.§The blueprint's NGFW simulator uses this declared order: validate and normalize the supplied packet; identify ingress and egress zones; evaluate ordered network rule; evaluate required identity and application conditions; apply attached inspection outcomes; produce allow, deny, or review; emit a structured explanation. This is a teaching model, not a universal appliance pipeline.§Read the fixture; validate its fields; resolve zones and ordered rule; evaluate each configured condition; apply the profile result; show final action and reason; record the policy and test evidence.§An approved service flow matches a narrow network rule but fails a required identity condition, so the simulator denies it and identifies the missing evidence.§Predictable policy order makes outcomes testable and teaches why a single “allow” label may not describe all inspection stages.§Have the instructor publish the evaluation order before the challenge and require students to cite the first failed condition.§Moving inspection before authorization without documenting it; hiding why a packet was denied; assuming all products share this sequence.§Trace a fixture through every declared stage and identify the first blocking condition.§A decision pipeline with ordered stages, stage outcomes, final action, and structured reason.§day1-lab-04§Stateful firewall and NGFW architecture comparison; Identity context and policy binding§8
Inspection profiles and control outcomes§Distinguish policy action from an attached inspection profile; define allow, deny, and review outcomes for supplied safe fixtures.§An inspection profile represents configured checks attached to a policy, such as a supplied benign threat finding or protocol anomaly. In this simulator, outcomes are fixture values and deterministic rules. The final policy combines network authorization and profile results according to a published precedence: explicit deny or required high-confidence block denies; an unresolved required check returns review; otherwise the authorized flow may proceed.§Confirm the flow is authorized; read the profile status and confidence; apply the declared precedence; show the reason; route review to an instructor decision without bypassing the failed control.§A safe fixture labeled “review required” is held for instructor analysis; no malicious file or live payload is generated or inspected.§Explicit outcomes avoid pretending a checkbox performs real malware detection and support accountable handling of uncertain results.§Show three sanitized fixtures and ask learners to predict the declared final action.§Assuming a profile name proves a scan occurred; silently allowing unresolved outcomes; mixing authorization with inspection result.§Choose the final action from the published precedence for allow, deny, and uncertain fixtures.§An authorized flow entering an inspection profile with deterministic result and documented decision precedence.§day1-lab-04§Layered NGFW policy evaluation§7
Security efficacy, false positives, and safe tuning§Evaluate inspection outcomes with both detection benefit and operational impact; change one scoped control at a time.§A detection control can miss relevant behavior or alert on benign activity. Tuning requires representative evidence, a defined tolerance for risk, ownership, controlled change, and retesting. Disabling a broad profile to clear a false positive can remove protection from unrelated services.§Review a sanitized finding; confirm asset and policy scope; compare expected and observed behavior; adjust a narrow exception or threshold under approval; test both detection and non-interference; document expiry and review.§A reporting integration produces a known benign alert. The owner records the fixture, narrows a time-limited exception to one source and service, then verifies that unrelated detections remain active.§Balanced tuning preserves protection while making alerts actionable and changes reversible.§Have students propose the smallest reversible adjustment and define a measure for catching over-broad suppression.§Disabling protection globally; treating every alert as true; adding a permanent exception with no owner or retest.§Given a false-positive report, state evidence, least-scope adjustment, expiry, and regression test.§A feedback loop from finding to evidence, scoped tuning, positive/negative regression tests, and review.§day1-lab-04§Inspection profiles and control outcomes§7
Management plane, telemetry, and auditability§Identify management-plane trust requirements and the telemetry needed to explain a policy decision and operational change.§The management plane configures and observes a security device; the data plane processes traffic. Secure operations require restricted administrative access, authenticated change attribution, configuration backup, time-consistent logs, health monitoring, and a clear record of policy version. The training exercise uses mock records only.§Restrict management path; authenticate an authorized operator; record a reviewed change; synchronize event context; capture rule and inspection outcomes; verify configuration version and recovery record.§An instructor reviews a policy simulation result with its rule ID, change reference, actor role, and timestamp, allowing the class to reproduce the decision without accessing a real device.§Auditability makes detection, change management, and incident reconstruction possible while protecting high-privilege interfaces.§Ask which fields are required to reconstruct a decision while avoiding unnecessary sensitive payload capture.§Exposing management on the user zone; sharing administrator credentials; relying on logs without reliable timestamps or change references.§List the minimum safe audit facts for reproducing a configuration decision.§A separated management path feeding authenticated change records and structured policy telemetry.§day1-lab-04§Firewall interfaces and policy plane§7
Availability, capacity, and inspection trade-offs§Explain how added inspection and state tracking can affect throughput, latency, and failure handling; evaluate trade-offs against service requirements.§State tables, packet parsing, classification, and inspection consume finite resources and can add latency. Capacity depends on workload, enabled features, packet mix, and device implementation. Fail-open and fail-closed behavior has security and availability consequences and must be a documented, tested design choice rather than an assumed universal default.§State the service objective; identify active inspection stages; observe supplied capacity and latency metrics; compare to declared bounds; select a documented failure mode; test alarm, fallback, and recovery expectations in the simulator.§A latency-sensitive internal service has a defined inspection profile and alert threshold. A simulated capacity warning triggers review rather than silently disabling controls.§Operational security includes maintaining enforcement during expected workload and failure conditions.§Use relative teaching metrics and explicitly label them as illustrative, not vendor benchmarks.§Assuming more inspection has no cost; choosing fail-open without risk acceptance; quoting simulator capacity as appliance performance.§Choose which metric and failure decision should be reviewed for a service with a stated latency objective.§A control-depth versus capacity diagram with monitoring thresholds and documented fail behavior.§day1-lab-04§State table keys, timeouts, and resource limits; Inspection profiles and control outcomes§7
NGFW policy lifecycle and validation evidence§Define a controlled lifecycle for policy objectives, configuration, testing, deployment approval, monitoring, and review.§A policy starts with a business need and named owner, becomes a scoped rule and attached controls, is tested with positive and negative cases, and is approved before deployment. After deployment, logs and operational metrics verify outcome; exceptions expire or receive review; changes retain a rollback path. This lifecycle is independent of product commands.§Record objective and owner; design the rule and inspection profile; run the simulator test matrix; approve and retain version evidence; review observed outcomes; renew or remove exceptions; repeat after material change.§A new external service is held until its owner confirms endpoints, the policy passes intended and prohibited flow tests, and the change record includes rollback and expiry.§Lifecycle discipline prevents temporary teaching settings from becoming undocumented production policy.§Have learners present evidence that a policy both satisfies a need and blocks a neighboring prohibited path.§Treating a passing positive test as complete validation; forgetting owner and expiry; shipping without a rollback or post-change check.§Submit a policy record containing requirement, owner, positive and negative result, approval, rollback, and review date.§A policy lifecycle loop from requirement through test, approval, observation, and periodic review.§day1-lab-04§Layered NGFW policy evaluation; Security efficacy, false positives, and safe tuning§7
Deep packet inspection and IPS signatures§Distinguish payload inspection from header matching; explain signature matching, anomaly detection, and inline prevention versus passive detection.§Deep Packet Inspection (DPI) examines the payload, protocol headers, and reassembled streams beyond Layer 4. An Intrusion Prevention System (IPS) uses deterministic signatures of known vulnerabilities and protocol anomaly checks to detect exploit attempts in real time. Inline IPS operates in the traffic path to drop malicious packets immediately, while passive IDS only alerts. Tuning requires staging signatures in alert mode before enabling blocking to prevent business disruption.§Receive reassembled application stream; match against active vulnerability and exploit signature database; check for protocol decode anomalies; evaluate signature severity and confidence; apply configured action (alert, drop, or reset); record event with signature ID, CVE reference, source, and destination.§An enterprise web application firewall detects an attempted path traversal exploit in an HTTP GET request. The inline IPS drops the malicious packet and resets the TCP connection, while normal web traffic continues uninterrupted.§DPI and IPS provide vulnerability-centric protection that shields unpatched systems from known exploit payloads even when the transport port is legitimate and permitted.§Explain that IPS signatures target exploit behavior, not benign software bugs. Emphasize why new signatures are staged in detect mode before moving high-confidence rules to prevent.§Assuming IPS replaces regular patching; enabling all signatures in block mode without baseline testing; confusing port-based filtering with payload inspection.§Identify whether a given exploit scenario requires Layer 4 filtering or DPI/IPS; distinguish inline blocking from passive alert mode.§An inline DPI engine reassembling application packets, comparing against an active signature database, and applying drop or alert actions.§day1-lab-04§Layered NGFW policy evaluation; Inspection profiles and control outcomes§7
Threat intelligence, malware sandboxing, and URL filtering§Explain how threat feeds, file reputation, sandboxing, and URL categorization enhance NGFW inspection; recognize feed latency and evasive threats.§Next-generation firewalls integrate external threat intelligence feeds (malicious IPs, domains, and file hashes) to update policy dynamically without manual rule creation. Antivirus engines check file signatures, while cloud or local sandboxes execute suspicious unknown files in an isolated environment to observe runtime behavior. URL filtering categorizes web destinations and restricts access to risky categories such as newly registered domains or known command-and-control infrastructure.§Extract destination IP, domain, and downloaded file hash; query real-time threat intelligence feeds and URL classification database; if file is unknown, forward sample to sandbox for dynamic behavioral analysis; enforce policy based on category, reputation score, and verdict; log telemetry to SIEM.§A user clicks a link in a phishing email to a domain registered two hours prior. The NGFW's URL filtering engine blocks the connection under the "Newly Registered Domains" high-risk category, preventing credential harvesting.§Automated threat intelligence and URL categorization block high-volume, commoditized threats before they reach endpoints, reducing operational triage overhead.§Remind learners that threat feeds lag behind zero-day campaigns. Emphasize that threat intelligence is an additive layer that complements, but never replaces, strong architecture and behavioral controls.§Relying solely on IP reputation feeds; assuming sandboxing gives instantaneous zero-latency verdicts on live streams; ignoring false positives from aggressive URL blocking.§Given an outbound communication attempt, determine whether IP reputation, URL categorization, or sandbox detonation is the primary defensive control.§A multi-tier detection pipeline showing threat feed lookup, URL categorization, file hash matching, and cloud sandbox detonation.§day1-lab-04§Inspection profiles and control outcomes; Security efficacy, false positives, and safe tuning§7
SSL/TLS decryption and encrypted traffic inspection§Explain why SSL/TLS forward proxy and inbound decryption are required for deep inspection; analyze privacy, legal, and operational trade-offs.§Over 85% of enterprise network traffic is encrypted with TLS. Without decryption, firewalls can only inspect SNI headers and IP/port tuples, leaving malware and command-and-control hidden in encrypted payloads. Inbound inspection protects internal web servers using the server's private key without client agents. Outbound forward-proxy inspection requires deploying an enterprise root CA certificate to all clients so the firewall can terminate and re-encrypt external sessions. Legal, privacy, and regulatory policies mandate bypassing decryption for sensitive categories like healthcare and finance.§Client initiates outbound TLS handshake; firewall intercepts Client Hello; firewall validates destination reputation and SNI; if excluded (e.g. banking), traffic is bypassed without decryption; if inspected, firewall establishes upstream TLS to server, generates downstream certificate signed by enterprise CA, decrypts and inspects payload, and re-encrypts toward client.§An employee downloads an attachment from an external cloud storage site over HTTPS. With SSL forward proxy enabled, the firewall decrypts the stream, identifies an embedded executable in the payload, blocks the download, and re-encrypts clean traffic.§Visibility is a prerequisite for security: advanced threats use standard encrypted protocols to evade Layer 4 controls. Decryption restores inspection capabilities at defined network boundaries.§Clarify the operational challenges of TLS decryption: certificate deployment, performance overhead, application certificate pinning, and employee privacy compliance.§Treating HTTPS encryption as proof that the destination or content is safe; attempting decryption without rolling out enterprise root CA; decrypting sensitive personal or financial categories in violation of privacy policy.§Identify the architectural differences between inbound SSL inspection and outbound forward proxy; explain why certificate pinning breaks forward-proxy decryption.§A split TLS handshake diagram showing client, enterprise CA, firewall proxy inspection engine, and remote destination.§day1-lab-04§Deep packet inspection and IPS signatures; Management plane, telemetry, and auditability§7
Enterprise deployment, DMZ design, and high availability§Design enterprise security zones, multi-homed DMZ boundaries, and High Availability (HA) active/standby clusters for resilient firewall operation.§Enterprise firewall architecture separates networks into distinct security zones: Untrusted (WAN/Internet), DMZ (Public Services), Internal LAN (Workstations), Data Center (Databases/Internal Apps), and Isolated Management. Traffic between zones requires explicit zone-pair policies; direct DMZ-to-LAN connections are strictly prohibited. For business continuity, firewalls deploy in High Availability (HA) pairs (Active/Passive or Active/Active) that synchronize state tables, routing, and policy over dedicated heartbeats to fail over seamlessly without dropping active connections.§Define interface-to-zone mappings; establish default-deny zone-pair rules (Internet->DMZ allowed on HTTPS, DMZ->Internal blocked); connect dedicated HA heartbeat and state synchronization links; configure keepalive timers and virtual IP (VIP) gateways; simulate primary device failure and verify state failover without session loss.§An enterprise hosts an e-commerce web portal in the DMZ. The firewall permits external HTTPS to the web server, permits the web server to initiate SQL queries to the internal database zone only on TCP 1433, and blocks all inbound connections from the DMZ to the corporate user LAN. If Firewall-A loses power, Firewall-B assumes traffic in under 500ms using synchronized connection states.§Architecture determines maximum security: a compromised DMZ host cannot compromise the corporate LAN if network segmentation and zone policies physically enforce the boundary. High availability ensures security controls do not become single points of failure.§Walk through the zone matrix. Emphasize why the DMZ must never initiate traffic into the internal network, and how HA state sync prevents session drops during failover.§Allowing the DMZ to initiate connections into the internal LAN; designing single-firewall architectures without HA redundancy; placing management interfaces in user zones.§Construct a zone-pair policy matrix for Internet, DMZ, and Internal LAN; explain the role of state synchronization in active/passive HA clusters.§An enterprise topology showing Internet, Active/Standby firewalls with sync link, DMZ web tier, internal database tier, and corporate LAN.§day1-lab-04§Trust boundaries and attack surface; Stateful inspection and connection tracking§8'''

rows = []
for line in raw.splitlines():
    if not line.strip():
        continue
    fields = line.split('§')
    if len(fields) != 13:
        raise ValueError(f'Expected 13 concept fields, got {len(fields)}: {fields[0]}')
    rows.append(fields)
if len(rows) != 48:
    raise ValueError(f'Expected exactly 48 concept records, got {len(rows)}')

title_to_id = {fields[0]: f'day1-concept-{i:02d}' for i, fields in enumerate(rows, 1)}

concepts = []
for i, fields in enumerate(rows, 1):
    session_index = (i - 1) // 12
    objective, explanation, workflow, example, relevance, instructor, mistakes, checks, diagram, lab, prereqs, minutes = fields[1:]
    split_list = lambda text: [item.strip() for item in text.split(';') if item.strip()]
    
    resolved_prereqs = []
    for p in split_list(prereqs):
        if p == 'None' or not p:
            continue
        if p == 'Service mapping and flow tuples':
            resolved_prereqs.extend(['day1-concept-19', 'day1-concept-20'])
        elif p in title_to_id:
            resolved_prereqs.append(title_to_id[p])
        elif p.startswith('day1-concept-'):
            resolved_prereqs.append(p)
            
    concepts.append({
        'id': f'day1-concept-{i:02d}', 'number': i, 'title': fields[0], 'sessionId': sessions[session_index]['id'],
        'durationMinutes': int(minutes), 'learningObjectives': split_list(objective),
        'technicalExplanation': explanation, 'architectureOrWorkflow': workflow,
        'enterpriseExample': example, 'securityEngineeringRelevance': relevance,
        'instructorExplanation': instructor, 'commonMistakes': split_list(mistakes),
        'knowledgeCheckObjectives': split_list(checks), 'diagramSpecification': diagram,
        'recommendedLab': [x.strip() for x in lab.split(';')], 'prerequisites': resolved_prereqs,
    })

curriculum = {
    '$schema': 'https://json-schema.org/draft/2020-12/schema',
    'schemaVersion': '1.0.0', 'programme': {
        'id': 'firewall-vpn-security-administration', 'title': 'Firewall & VPN Security Administration',
        'instructor': 'Naveen Kumar Yadav Loya', 'dates': {'start': '2026-11-16', 'end': '2026-11-20'},
        'location': 'ShadowXLab Cyber Range', 'durationLabel': '5 Days',
    },
    'day': {'id': 'day-1', 'index': 1, 'title': 'Security & Firewall Foundations',
        'objectives': ['Explain foundational network security goals, threats, vulnerabilities, and attack surfaces.', 'Map IP addresses, subnets, ports, protocols, and authorized packet flows.', 'Predict basic stateless and stateful firewall decisions, including a simplified TCP handshake.', 'Explain the major layers and operational limits of NGFW policy processing.'],
        'sessions': sessions,
        'conceptsPerSession': 12, 'conceptCount': len(concepts), 'concepts': concepts,
        'labs': [
            {'id':'day1-lab-01','number':1,'title':'Attack Surface & Threat Mapping','linkedSessionIds':['d1-s1','d1-s2'],'conceptIds':[c['id'] for c in concepts if 'day1-lab-01' in c['recommendedLab']]},
            {'id':'day1-lab-02','number':2,'title':'Firewall Rule Engineering','linkedSessionIds':['d1-s2'],'conceptIds':[c['id'] for c in concepts if 'day1-lab-02' in c['recommendedLab']]},
            {'id':'day1-lab-03','number':3,'title':'Network Segmentation & Stateful Firewall','linkedSessionIds':['d1-s3'],'conceptIds':[c['id'] for c in concepts if 'day1-lab-03' in c['recommendedLab']]},
            {'id':'day1-lab-04','number':4,'title':'NGFW Architecture & Security Policy','linkedSessionIds':['d1-s4'],'conceptIds':[c['id'] for c in concepts if 'day1-lab-04' in c['recommendedLab']]},
        ],
        'assessments': {
            'conceptQuestionCount': 240, 'questionsPerConcept': 5,
            'sessionAssessmentQuestionCount': 80, 'questionsPerSession': 20,
            'finalAssessmentQuestionCount': 40, 'finalQuestionsPerSession': 10,
            'passingScorePercent': 70, 'answerKeysClientVisible': False,
        },
    },
}
(root / 'data/day1-curriculum.json').write_text(json.dumps(curriculum, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

concept_md = ['# Day 1 Learning Content', '', '> Instructor-led instructional material for the 48 concepts in the Day 1 curriculum. Concepts are intentionally mapped 12 per supplied session. The four labs are simulated, described in [LABS.md](./LABS.md), and do not imply appliance or VM access.', '']
for s in sessions:
    first, last = s['conceptRange']
    concept_md += [f"## Session {s['index']} — {s['title']}", '', f"**Time:** {s['start']}–{s['end']} · **Concepts:** {first}–{last} · **Lab links:** {', '.join(s['labReferences'])}", '']
    for c in concepts[first-1:last]:
        concept_md += [f"### {c['number']:02d}. {c['title']}", '', '**Learning objectives**']
        concept_md += [f'- {x}' for x in c['learningObjectives']]
        concept_md += ['', '**Technical explanation**', '', c['technicalExplanation'], '', '**Architecture or workflow**', '', c['architectureOrWorkflow'], '', '**Enterprise example**', '', c['enterpriseExample'], '', '**Security engineering relevance**', '', c['securityEngineeringRelevance'], '', '**Instructor explanation**', '', c['instructorExplanation'], '', '**Common mistakes**']
        concept_md += [f'- {x}' for x in c['commonMistakes']]
        concept_md += ['', '**Knowledge-check objectives**']
        concept_md += [f'- {x}' for x in c['knowledgeCheckObjectives']]
        concept_md += ['', f"**Diagram specification:** {c['diagramSpecification']}", '', f"**Recommended lab linkage:** {', '.join(c['recommendedLab'])}", '', f"**Prerequisites:** {', '.join(c['prerequisites']) if c['prerequisites'] else 'None'} · **Suggested teaching time:** {c['durationMinutes']} minutes", '']
(root / 'LEARNING_CONTENT.md').write_text('\n'.join(concept_md))

files = {}
files['README.md'] = r'''# ShadowXLab Day 1 implementation package

## Purpose

This package is a repository-grounded implementation blueprint for expanding the existing ShadowXLab training application with Day 1 learning content. It is specification and curriculum data only; it does not claim that the application features described here have been implemented.

## Start here

1. Read [PRODUCT_SPEC.md](./PRODUCT_SPEC.md) for scope, behavior, completion, and security requirements.
2. Read [UI_DESIGN.md](./UI_DESIGN.md) and [LEARNING_CONTENT.md](./LEARNING_CONTENT.md) for the interface and all 48 instructor-ready concepts.
3. Implement the four deterministic simulated labs from [LABS.md](./LABS.md).
4. Build the assessment behavior from [ASSESSMENTS.md](./ASSESSMENTS.md); keep answer keys out of learner-delivered data.
5. Use [DATA_MODEL.md](./DATA_MODEL.md) to reuse rather than duplicate the inspected schema.
6. Follow [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) and verify [ACCEPTANCE_TESTS.md](./ACCEPTANCE_TESTS.md).
7. Importable curriculum data is in [data/day1-curriculum.json](./data/day1-curriculum.json).

## Audited repository baseline

The inspected application is already a single-route ShadowXLab training dashboard, not a blank repository. `/` is declared by `src/routes/index.tsx`; it mounts `src/components/training-platform-app.tsx`. Programme content and types are centralized in `src/lib/training-platform.ts`; the UI already contains programme management, schedule, day-topic modules, checklist simulation, a four-question quiz, resources, progress, attendance, and administration views. `src/styles.css` contains the dark navy and cyan design tokens and responsive layouts. The current browser state is persisted in localStorage under `shadowxlab-training-state-v1`.

Database setup files define normalized programme and learner tables, an initial seed, row-level policies, and a role table. Their presence does not prove that a remote database is connected or those scripts have been applied. No application auth flow or generated database client is present in the inspected `src/` tree. The screens in the current application are not protected by sign-in. See [DATA_MODEL.md](./DATA_MODEL.md) and [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) before any persistent-storage change.

The repository's root `AGENTS.md` reserves database schema changes to Lovable-managed tooling and prohibits hand-editing migration files. Accordingly, this package identifies data requirements and contracts, but does not add or alter SQL migrations.

## Learning package totals

- 1 supplied Day 1 with the existing four timetable sessions.
- 12 concepts per session; exactly 48 total, with objectives, explanation, workflow, enterprise example, instructor notes, common mistakes, checks, diagram instructions, lab links, prerequisites, and time estimates.
- 4 simulated lab specifications.
- Assessment design capacity: 240 concept questions (5 per concept), 80 session questions (20 per session), and 40 final questions (10 per session). Assessment documents provide tested-format requirements and real examples, not a fabricated 360-question question bank.

## Execution notes

Keep Day 2–Day 5 and the existing sidebar/navigation unchanged. Extend the current centralized programme model and current views; do not introduce a second learning or routing engine. Do not change supplied timetable times. Only Day 1's separate learning content, labs, and assessment behavior is in scope. The single scheduled Day 1 lab block is 11:45–13:00; Labs 03 and 04 are self-paced simulations linked to the existing afternoon sessions unless the instructor explicitly schedules additional time. See the assumption register in [PRODUCT_SPEC.md](./PRODUCT_SPEC.md).

## Diagrams

- Learning navigation and learner journey: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md#learning-navigation-and-learner-journey)
- Completion, assessment, and progress workflows: [PRODUCT_SPEC.md](./PRODUCT_SPEC.md#workflow-diagrams)
- Lab execution: [LABS.md](./LABS.md#lab-execution-workflow)
- Existing and proposed data relationships: [DATA_MODEL.md](./DATA_MODEL.md#relationship-diagram)
- Extension architecture: [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md#architecture-diagram)

## JSON contract and validation

The curriculum JSON is versioned (`schemaVersion`) and uses stable IDs. Each concept's `sessionId` references a session; each lab's session references and concept IDs must resolve. `recommendedLab` contains lab IDs. Dates use ISO `YYYY-MM-DD`; times use 24-hour `HH:MM`; durations are integer minutes; question counts and pass threshold live under assessment metadata. Validate the package before application import:

```sh
python3 -m json.tool docs/day1/data/day1-curriculum.json >/dev/null
```

This package does not install dependencies, call a remote service, create a route, update the app, or apply a schema change.
'''

files['PRODUCT_SPEC.md'] = r'''# Day 1 Product Specification

## Status and scope

This document specifies a proposed Day 1 extension to the audited ShadowXLab app. It is not a statement that the new experience exists today. Preserve the current programme, sidebar, dashboard, and Day 2–Day 5 data. Extend the centralized programme and state model in `src/lib/training-platform.ts`, and integrate with the single existing `/` route and views in `src/components/training-platform-app.tsx`.

### Day 1 definition

- Programme: Firewall & VPN Security Administration.
- Day: Security & Firewall Foundations.
- Instructor: Naveen Kumar Yadav Loya.
- Four sessions and times are defined in [the curriculum JSON](./data/day1-curriculum.json), matching the seeded schedule.
- 48 concepts, exactly 12 per session, in supplied topic scope.
- Four simulated labs: Attack Surface & Threat Mapping; Firewall Rule Engineering; Network Segmentation & Stateful Firewall; NGFW Architecture & Security Policy.
- Assessments: 240 concept-question capacity, 80 session-question capacity, 40 final-question capacity.

## Learner requirements

1. From Dashboard or Schedule, select Day 1 and open its existing session without losing the selected programme or day.
2. See the four supplied sessions in original order and times. Expand a session to view its 12 ordered concepts, completion state, related lab, and assessment entry point.
3. Open a concept, navigate next/previous within that session, review all instructional fields, and mark it complete only after the learner confirms completion or passes the configured knowledge check.
4. Open an associated simulated lab, read scenario and constraints, complete tasks, receive deterministic validation feedback, and reset to the initial lab state.
5. Submit a concept, session, or final assessment. Show score, per-question feedback after submission, pass/fail, attempt, and a clear retry path according to instructor policy.
6. See progress by concept, session, lab, and assessment; progress must be derived from records and configuration, not an arbitrary dashboard constant.
7. Refresh or reopen and retain the same learner's progress if an authenticated persistent store is actually integrated. In local-only mode, disclose browser-local storage and do not imply cross-device or multi-user persistence.

## Instructor requirements

- Maintain configured content and ordering; preview as learner; review completion, attempts, scores, lab evidence, and timestamps by learner; export a scoped report only when authorized.
- Set publish state, pass score, attempt policy, retries, and whether knowledge checks are required for concept completion.
- Do not permit an instructor action solely because a control is visible in the current unauthenticated dashboard. Require a verified instructor/administrator role before reading or changing learner records or answer keys.
- Every instructor action that changes attempts, completion, policy, or content has actor, time, scope, and outcome evidence.

## Content and assessment rules

- All Day 1 material comes from the supplied Day 1 topics. No later-day module, vendor feature, real attack, or appliance command is introduced as a Day 1 requirement.
- Content and learning objects load by stable IDs from configuration. Do not encode concept names/counts in view conditionals.
- Each session has 12 concepts in the authored sequence. The learner may review earlier concepts; prerequisite rules should block only forward completion checks when the configured prerequisite has not been satisfied.
- Current application has a four-item programme quiz with client-visible `answer` values in `src/lib/training-platform.ts`. That is a demo implementation and must not be reused as the secure Day 1 assessment pattern. Before production use, answer keys must remain server-side and assessment submission must be validated by a trusted server/data boundary. Existing SQL's public read policy on published `programme_assessments` is another exposure to resolve or avoid for confidential answer keys.
- Assessment capacities are exact: five concept questions per concept = 240; 20 session questions per session = 80; 10 final questions per session = 40. A question is tagged with exactly one concept and one assessment type; final questions are distributed 10 per session. The JSON currently specifies counts and sample data model rather than supplying all 360 questions.
- Use 70% as initial pass-score proposal matching the existing programme completion rule. Instructors can configure it. Do not silently turn this into a universal fixed platform rule.
- Question types: single-best-answer, multi-select with partial-credit rule stated before attempt, sequence/order, and short scenario response with rubric. Maintain clear equivalent feedback for keyboard and screen-reader users.

## Completion and progress logic

- Concept completion: learner explicitly marks reviewed and meets the configured check threshold; store completed status and timestamp. A revisit does not erase completion.
- Session completion: all configured concepts complete and the required session assessment is passed. If the instructor disables either requirement, use that programme configuration and show the resulting rule.
- Day completion: all configured sessions complete, including the existing timetable sessions, subject to the course completion settings. Labs count only if the configuration marks them as required.
- Programme completion continues to follow `completionRules`; do not change it as part of this Day 1 expansion.
- Progress panel displays numerator/denominator and a percentage derived from valid active configuration records. If no concepts are complete, show 0 for the Day 1 concept measure. Preserve the existing 42% initial dashboard reference only for its currently seeded untouched state; do not use it as earned Day 1 progress.
- Editing/removing a concept does not silently transfer its completion to a different concept ID. Orphaned progress is excluded from totals and retained/handled according to an explicit archive policy.

## Access control, privacy, and safety

- Day 1 lesson text and published curriculum may be readable by a learner. Private learner progress is only readable to that learner and authorized staff; answer keys and unreleased assessment questions are not learner-readable before submission.
- Instructor controls require server-verified role checks. The inspected app has no sign-in interface or client integration; SQL role definitions alone do not establish a protected application.
- Do not rely on the SQL policy that assigns anonymous progress to the shared `local-learner` identity for multi-user learning data. Local-only mode is a clearly labeled single-browser demonstration.
- Lab environments are deterministic simulations over supplied fixtures. No real packet is sent, no host is scanned, no command is executed, and no live firewall or VM is controlled.
- Collect only assessment and progress facts needed for training. Display a concise notice before storing or exporting learner records.

## States and failure behavior

- Empty: no concepts/labs configured; provide an authorized configuration action and avoid broken navigation.
- Loading: retain selected day/session context, show content-shaped placeholders, disable submission until required data is ready.
- Offline/failed save: preserve unsent work in local pending state where safe; show that it is not yet synced and provide retry. Never show “saved” on a failed write.
- Invalid configuration: reject import with field path and reason; do not partially replace the active configuration.
- Missing prerequisite or lab dependency: show the named unmet requirement and a link to it.
- Assessment failure: show score, missed concept references, remaining attempts, and retry availability without exposing correct answers before submission.
- Unauthorized instructor action: deny server-side and explain that the account lacks access; hiding the control is supplementary, not enforcement.
- Stale or removed content: preserve a safe progress history reference and prevent an obsolete concept from inflating current completion.

## Responsive and accessibility requirements

- Preserve desktop sidebar and existing mobile navigation. At narrow widths, sessions and concepts become single-column, controls wrap without clipping, and the next/previous concept controls remain visible.
- Use semantic headings, ordered lists, labels, accessible names, keyboard-operable accordions and tabs, visible focus, status announcements, and text labels in addition to color.
- Respect reduced-motion settings and avoid relying on glow, color, or icon shape alone to convey completion or error.
- Long concept titles, answers, and lab outcomes wrap without horizontal page scrolling.

## Assumption register and gaps

1. The repository confirms four Day 1 timetable blocks and one scheduled lab block (11:45–13:00). The requested four labs cannot all receive dedicated timetable time without a schedule change. This blueprint links Lab 01/02 to the morning lab window and Lab 03/04 to their matching afternoon lessons as optional embedded/self-paced simulations. The instructor must decide whether to reserve further delivery time; this package does not change the timetable.
2. The 70% threshold is taken from the existing seed completion rules; instructor configurability is required.
3. The product requirements specify question-bank sizes but do not ask for all 360 bank items in this package. This package provides a concrete blueprint and sample bank with answers; full bank authoring and review remains a content-production task.
4. SQL files exist in the repo, but the connection and whether scripts are applied are unverified. No new migration is prescribed.
5. Existing app progress is localStorage-based, and the app has no verified login. An authenticated persistent implementation depends on connecting/configuring the managed backend and verifying the role model before deployment.

## Learning navigation and learner journey

```mermaid
flowchart TD
  D[Dashboard] --> S[Schedule: select Day 1]
  S --> O[Open supplied session]
  O --> C[Choose one of 12 ordered concepts]
  C --> L[Read concept and inspect diagram]
  L --> K[Knowledge check]
  K -->|Pass or configured complete| P[Persist concept progress]
  K -->|Retry allowed| L
  P --> N{More concepts in session?}
  N -->|Yes| C
  N -->|No| SA[Session assessment]
  SA -->|Pass| SC[Session complete]
  SA -->|Retry allowed| SA
  O --> V[Related simulated lab]
  V -->|Validate| P
  SC --> RP[Progress view]
  RP --> FA[Day 1 final assessment]
```

## Workflow diagrams

### Concept completion

```mermaid
flowchart TD
  A[Open concept by stable ID] --> B{Configured prerequisites complete?}
  B -->|No| C[Show unmet prerequisite]
  B -->|Yes| D[Render instructional content]
  D --> E[Submit concept check]
  E --> F{Validated result meets threshold?}
  F -->|No| G[Record attempt and feedback]
  G --> H{Retry remains?}
  H -->|Yes| E
  H -->|No| I[Keep concept incomplete]
  F -->|Yes| J[Record completion and timestamp]
  J --> K[Recalculate progress from active IDs]
```

### Assessment workflow

```mermaid
flowchart TD
  A[Authorized learner starts configured assessment] --> B[Server selects eligible questions]
  B --> C[Deliver prompts and choices without answer keys]
  C --> D[Validate attempt, scope, and response shape]
  D --> E[Trusted scoring and rubric evaluation]
  E --> F[Persist score, responses, type, and time]
  F --> G{Pass threshold reached?}
  G -->|Yes| H[Unlock configured completion]
  G -->|No, retry allowed| I[Show feedback and retry count]
  G -->|No retries| J[Show review and instructor path]
```

### Progress calculation

```mermaid
flowchart LR
  A[Active programme config IDs] --> C[Valid completed concept IDs]
  B[Authenticated learner records] --> C
  C --> D[Completed concepts / configured concepts]
  D --> E[Session status from concepts + assessment + lab rules]
  E --> F[Day status from configured sessions]
  F --> G[Programme rules remain authoritative]
  G --> H[Render counts, status, and percentages]
```
'''

files['UI_DESIGN.md'] = r'''# Day 1 UI Design Specification

## Design intent and constraints

Extend the existing ShadowXLab interface rather than replacing it. Preserve the fixed sidebar, top header, programme context, current dashboard, and responsive mobile dock. The existing design source is `src/styles.css`: dark navy surfaces, semantic cyan/turquoise tokens, fine borders, restrained glow, compact technical type, reduced-motion handling, and breakpoints at 1150px and 760px. Use these tokens and existing Button/Input/Card patterns; do not introduce a parallel theme or hard-coded colors.

No institutional label or imagery should be introduced. Use existing ShadowXLab brand assets only. Do not alter the Day 2–Day 5 presentation.

## Navigation and information architecture

- Keep existing sidebar entries and labels exactly as currently implemented.
- Keep the existing `Schedule` view as the entry for selecting Day 1; a selected session opens within that view or a clearly linked learning panel, not a new top-level navigation engine.
- `Learning Modules` may provide a cross-session concept index, but should remain backed by the same Day 1 curriculum IDs and learning state.
- Dashboard Day 1 schedule links must select Day 1 and focus the selected session.
- Lab links open the selected lab within the existing `Virtual Lab` view while preserving `dayId`, `sessionId`, and `labId` context.
- Progress view adds Day 1 concept and assessment measures without removing current session progress.

## Schedule expansion

Retain the current day tabs, session order, times, types, and descriptions. Each session row gains:

- A stable, accessible expand/collapse control with expanded state.
- Existing session title, type, time, and completion indicator.
- An expanded panel with `n / 12 concepts`, session assessment state, and a “Continue learning” action.
- Twelve ordered concept rows with number, title, duration, prerequisite status, completion status, and a clear open action.
- Lab badge and “Open simulated lab” action only when referenced by that session.

At desktop widths, keep the existing schedule content width and table-like alignment. At mobile widths, stack time and status above the title; place actions below the wrapped title. Do not force a horizontal scroller for the actual learning content.

## Concept learning view

A concept opens in the existing workspace rather than a separate microsite. Layout at desktop:

```text
Session identity / 01 of 12                     Progress 05 / 12
Concept navigation | Main content                 Context rail
Previous         Title, objectives                Lab linkage
Concept list     Explanation and workflow          Prerequisites
                Enterprise example                 Check status
                Security relevance                  [Complete / check]
                Instructor note                     Next concept
```

- Use a compact session breadcrumb, current concept number, title, and duration.
- Show objectives in a short scannable list before technical explanation.
- Put workflow, example, security relevance, instructor note, mistakes, check objectives, and diagram specification in semantic sections. Preserve full text; do not collapse mandatory material behind inaccessible controls.
- The diagram area may be a simple semantic rendered diagram or described illustration; do not claim a missing bitmap exists. It must have a text equivalent.
- Previous/next buttons are stable in size and disabled at boundaries; concept index navigation remains keyboard operable.
- Completion action states are `Not started`, `In progress`, `Complete`, and `Needs review`. A completion state is not communicated by color alone.
- On narrow screens, use a single column; concept navigation collapses to an accessible selector or disclosure. Keep progress and “Next” action reachable without obscuring text.

## Lab interface

Extend the existing Virtual Lab page and current simulated topology, controls, instructions, and checklists. Do not suggest that the topology currently executes traffic. Add a structured lab shell:

- Lab identity, session linkage, time estimate, reset action, and prominent “SIMULATION ONLY” state.
- Scenario and starting state before interactive controls.
- Topology/data panel; task list; deterministic controls and fixture traffic; validation results; score/evidence panel.
- Each task reports expected behavior, observed simulated behavior, pass/fail, and explanation. Learner can retry or reset.
- The footer must say no real devices, packets, hosts, or VMs are involved.
- A reset clears this lab attempt's transient configuration, not curriculum or unrelated learner progress.
- Keep contrast and touch-target sizes consistent with existing controls. At mobile widths, stack topology, task list, then results.

## Assessment interface

- Show type, session/concept scope, number of questions, pass threshold, attempts remaining, and privacy/saving status before starting.
- Use a stepper and progress count, not a wall of questions; keep response controls accessible and keyboard navigable.
- Do not reveal correct options or answer rationale before final submission. After submission, show correct answer, explanation, concept reference, and retry eligibility.
- For multi-select, state whether partial credit applies; for ordering or short response, state scoring rubric before response.
- On save failure, preserve the response locally only where safe and show “Not synced” rather than success.

## Progress and instructor panels

Learner progress adds a Day 1 breakdown with concept completion, session assessment results, lab pass state, and final assessment state. Each percentage states its denominator. Empty progress shows 0 of configured total, not a prefilled earned value. Instructor Console shows per-authorized-learner summary, attempts, completion, and lab submissions; never expose another learner's records to a learner role.

## Component hierarchy and code integration target

These are proposed responsibilities, not names already present in the repository. Reuse current `ScheduleView`, `ModulesView`, `LabView`, `AssessmentsView`, `ProgressView`, current shared `Card`, `SectionHeading`, `Button`, and state container in `src/components/training-platform-app.tsx`; keep curriculum types/data centralized in `src/lib/training-platform.ts`. If the file becomes unwieldy, extract focused view modules while preserving a single data model and document the structural choice in root `AGENTS.md` before code implementation.

```text
TrainingPlatformApp (existing)
├── ScheduleView (existing; extend)
│   └── DaySessionAccordion (proposed)
│       ├── SessionConceptList (proposed)
│       └── SessionAssessmentStatus (proposed)
├── ConceptLearningPanel (proposed)
│   ├── ConceptNavigator (proposed)
│   ├── ConceptArticle (proposed)
│   └── ConceptCheck (proposed)
├── LabView (existing; extend)
│   ├── LabScenarioPanel (proposed)
│   ├── SimulationWorkspace (existing topology/control patterns)
│   └── LabValidationPanel (proposed)
├── AssessmentsView (existing; extend)
└── ProgressView / InstructorView (existing; extend)
```

## Interaction states

| Control | Idle | Active | Success | Failure |
| --- | --- | --- | --- | --- |
| Session accordion | Collapsed with session summary | Expanded, `aria-expanded=true` | N/A | Safe inline unavailable state |
| Concept row | Not started | Open/current | Complete with text + icon | Needs review with explanation |
| Lab task | Not attempted | Running deterministic fixture | Passed with evidence | Failed with reason and retry/reset |
| Assessment | Not started | In progress with saved status | Passed and unlocks configured rule | Failed, attempt policy and retry shown |
| Persist action | Saved/ready | Saving, duplicate action disabled | Synced with time | Not synced; retry offered |

## Empty, loading, error, responsive behavior

- Empty Day 1 config: no false “12 concepts” placeholder; report that learning content is not configured and provide an authorized configuration route.
- Loading: reserve layout height, show text labels, preserve selected Day/session.
- Invalid import: identify the field and reject atomically.
- Small screens: test at 320, 375, and 760 CSS px; ensure no clipped titles/buttons, no body-level horizontal overflow, and no hidden “Submit”/“Next” controls.
- Keyboard: tab order follows visible order, accordion uses native button behavior, all inputs are labeled, focus is visible, and score/status updates are announced.
- Reduced motion disables animated topology paths and nonessential transitions.
'''

files['LABS.md'] = r'''# Day 1 Virtual Labs

## Safety and execution model

All four exercises are deterministic software simulations using predefined, benign fixtures. They do not send packets, scan networks, run executables, connect to a firewall, or create a virtual machine. Controls mutate only the current lab attempt. Use the exact requirements below as the engine contract; no vendor CLI or real target is part of the lab.

Lab 01 and Lab 02 are associated with the supplied 11:45–13:00 lab session. Lab 03 is a self-paced simulation linked to the 14:00 stateful inspection lesson; Lab 04 is a self-paced simulation linked to the 15:45 NGFW lesson. Do not alter the supplied schedule to make room for these extensions.

## Shared lab record

Persist a lab attempt with stable `labId`, programme/day/session, learner scope, attempt number, started/submitted times, initial state version, answer/configuration snapshot, task results, score, and pass status. Treat a config version change as a new attempt context. Authoritative persistence and user identity depend on verified authentication; local-only mode must be labeled as browser-local. Do not trust a client-supplied score when durable or multi-user records are used.

## Lab 01 — Attack Surface & Threat Mapping

### Scenario and objectives

A fictional enterprise has a user zone, a public reporting service, a management interface, and an approved external dependency. Learners build a concise threat map using supplied inventory and flow facts. Objectives: identify assets and ownership; mark trust boundaries and exposure; distinguish fact from assumption; prioritize a threat; propose a least-privilege control and a verification check.

### Environment and initial state

- Fixed topology fixture: `USER-ZONE`, `DMZ`, `ADMIN-ZONE`, `INTERNET`; no real addresses route anywhere.
- Asset records: user workstation group, reporting service, management interface, and dependency endpoint; each includes owner, purpose, data class, and allowed-flow evidence.
- Three supplied observations: intended HTTPS access, an unowned management path, and a benign but undocumented flow.
- Initial threat map is empty; all tasks are incomplete.

### Student instructions and tasks

1. Assign each asset an owner and business purpose from the fixture.
2. Mark the public, user, and administration trust boundaries.
3. Classify the observed management path as confirmed exposure, not confirmed compromise.
4. Link one threat scenario to asset, boundary, impact, likelihood evidence, and confidence.
5. Select the narrowest proposed control and specify a positive and negative verification case.

### Topology and expected outcomes

Internet can reach only the reporting service's stated public listener in the intended state. The management interface belongs to the admin zone and has no public allow path. The learner identifies the unowned path as a reviewable exposure, not as proof of an attack. Every scenario has a trace to an asset, evidence, owner, control, and test.

### Validation and scoring

Score 100 points: asset ownership 15; boundary placement 20; fact-versus-assumption classification 15; threat linkage and confidence 20; scoped control 15; positive/negative validation 15. Pass at the configured 70% threshold. Validation checks IDs and selections against the fixture, not natural-language free text. Any task that asserts compromise without evidence receives no points for evidence classification.

### Hints and failure conditions

Hints reveal one missing relationship at a time. Fail a task if the learner treats an IP/alert as proof of actor identity, grants a public management path, or submits a threat with no asset. Failure is recoverable: revise and resubmit.

### Instructor solution, reset, completion

Instructor key: keep management access on ADMIN-ZONE; public reporting service is the only intended public path; classify the unowned management path as exposure requiring owner confirmation; prioritize by asset impact and confirmed reachability; verify allowed HTTPS succeeds while management access is denied and logged. Reset restores fixture, clears current task answers and score, and starts a new attempt; it must not delete unrelated progress. Completion requires all six validation categories and a passing score.

## Lab 02 — Firewall Rule Engineering

### Scenario, objectives, environment

Permit a documented user-to-reporting service flow while denying management access and unrelated services. Objectives: translate a requirement into a scoped rule; predict ordered first-match behavior; apply default deny; test positive and negative cases; interpret simulation logs. The environment contains one ordered rule list and benign packet-attribute fixtures only.

### Initial state and topology

- Zones: USER, DMZ, ADMIN, and EXTERNAL.
- Rule list starts empty; the terminal implicit action is `DENY`.
- The permitted fixture is USER to one DMZ reporting host over TCP/443.
- Negative fixtures include USER to ADMIN over TCP/22, USER to the reporting host on an unapproved port, and EXTERNAL to ADMIN.
- No other addresses, targets, packet generator, or arbitrary destination input is accepted.

### Rule-processing specification

The lab's own deterministic semantics are authoritative and deliberately small:

1. A candidate packet is a tuple: `direction, sourceZone, sourceAddress, destinationZone, destinationAddress, protocol, sourcePort, destinationPort`.
2. Rules are evaluated in ascending `order` (unique positive integer). An omitted match field is wildcard only when the author explicitly selects `ANY`; empty or malformed fields are invalid, not wildcards.
3. Match fields use exact zone, IPv4 CIDR membership, protocol, and inclusive destination-port range. Source port may be constrained but defaults to `ANY`.
4. The first fully matching rule decides `ALLOW` or `DENY`; evaluation stops. Later matches are shadowed for that tuple.
5. If no rule matches, implicit `DENY` decides. The simulator records `ruleId` or `implicit-deny`, matched fields, action, and explanation.
6. This lab is stateless: request and response packets are evaluated independently. Do not imply established-flow tracking here; Lab 03 supplies that behavior.
7. Malformed tuples or ports outside 0–65535 produce `INVALID_INPUT`, not an allow/deny policy result. Restrict user input to the supplied lab fixture to prevent arbitrary target or port testing.

### Student tasks and expected outcomes

1. Create the smallest allow rule for USER → reporting host, TCP, destination 443.
2. Run the allowed fixture and verify the intended explicit rule allows it.
3. Run all three negative fixtures and verify implicit or explicit deny.
4. Add an intentionally broad rule above a narrow deny, observe first-match shadowing, then repair the ordering/scope.
5. Export a readable rule rationale and test matrix in the attempt record.

Expected final result: one narrow allow; management, unrelated service, and external-to-admin flows denied; no unintended rule shadowing; each result has a clear decision reason.

### Validation, scoring, hints, failure

Score 100: scope 25; correct action/order 20; positive test 15; three negative tests 24 (8 each); shadowing diagnosis and repair 10; rationale 6. Passing threshold is configured by the course. Hints reveal tuple fields, then an example decision trace. Fail the run if a broad `ANY` rule permits management or if no default deny remains. No irreversible state: repair and rerun.

### Instructor solution, reset, completion

Instructor key: a USER-zone source CIDR to a single reporting host, DMZ destination, TCP/443, allow; follow with no broad allow; keep implicit deny last. Assert all negative fixtures denied. The deliberately broad earlier allow demonstrates that first-match policy makes the later management deny ineffective; remove/narrow/reorder and retest. Reset clears user-created rules, test results, and score, restoring the empty list and implicit deny. Completion requires all four expected decisions and passing score.

## Lab 03 — Network Segmentation & Stateful Firewall

### Scenario and topology

A user subnet communicates with a reporting service in the DMZ. The administration zone is isolated. Learners validate zone boundaries, address-plan consistency, forward and return routes, and a simplified stateful TCP exchange. All addresses are labels/fixture data and cannot reach the public network.

### Initial state

- USER and DMZ have non-overlapping fixture prefixes; ADMIN has no permitted user route.
- One route path is correct; a selectable fixture introduces an asymmetric return route.
- Firewall starts with one narrow USER → DMZ TCP/443 policy and state tracking enabled.
- Session table starts empty with a declared deterministic capacity and short teaching timeout.

### Student instructions and tasks

1. Assign supplied endpoints to the correct zones and verify prefixes do not overlap.
2. Trace the forward and reverse route; choose the correct return path.
3. Initiate a simulated TCP SYN matching the permitted flow; observe `NEW/SYN_SENT`.
4. Process only a reverse SYN-ACK with the matching endpoint tuple; observe `SYN_RECEIVED`.
5. Process the final forward ACK; observe `ESTABLISHED`.
6. Verify matching reply traffic is accepted by state while an unrelated inbound packet and ADMIN flow are denied.
7. Test FIN, RST, and idle timeout; observe close/reset/expired states.
8. Enable the asymmetric-route fixture and explain why the return packet is invalid at a device that did not see initiation.

### Simplified TCP/state model

- Session key: protocol plus both endpoint addresses and ports, canonicalized with an initiator direction and zone pair.
- Allowed matching SYN creates `SYN_SENT` with start and last-seen time.
- A reverse SYN-ACK with matching endpoints/transposed ports moves to `SYN_RECEIVED`.
- A matching final ACK from initiator moves to `ESTABLISHED`.
- Matching packets in an allowed established flow are accepted and refresh last-seen time.
- FIN moves to `CLOSING`; RST moves to `RESET` and closes the fixture; declared idle expiry moves to `EXPIRED` and removes active state.
- A wrong-tuple packet, unmatched ACK, unsolicited SYN-ACK, prohibited zone flow, or reply unseen by the enforcing device is `INVALID_STATE` or `DENIED` with a reason.
- UDP is a separate optional short-lived pseudo-state: allowed request creates tuple-bound temporary state; only matching response before timeout is accepted. It is not a transport handshake.
- These rules are a teaching model; they do not implement TCP sequence numbers, retransmission, fragments, NAT, real timeouts, or a network stack.

### Validation and scoring

Score 100: correct zone/prefix 15; forward and return route 15; handshake sequence 25; tuple-matched reply 15; denied unrelated/ADMIN flows 10; teardown and expiry 10; asymmetric-path diagnosis 10. Passing uses the configured threshold. The simulator validates deterministic transitions and does not grade claims about live packets.

### Hints, failure, instructor solution, reset

Hints identify the packet direction, then the expected prior state. Fail only the affected task for wrong transition, wrong tuple, or a broad zone bypass; allow correction. Instructor key: maintain non-overlapping USER/DMZ/ADMIN; symmetric route through the state-owning firewall; only the permitted tuple establishes; reply packets require a matching state; ADMIN and unrelated inbound remain denied. Reset restores addresses, routes, rule, empty session table, and counters; it must not clear learner's other lab attempts. Complete when all required transitions and negative cases pass.

## Lab 04 — NGFW Architecture & Security Policy

### Scenario and environment

Learners process a small set of safe, pre-authored flow fixtures through a published NGFW policy pipeline. Fixtures include an authorized application with matching identity, a wrong identity, an unknown application classification, an inspection result marked block, and a review-required result. No payload bytes, malware sample, live DPI, or external intelligence feed is processed.

### Initial state and student tasks

Initial policy permits a narrow service flow by zone/tuple; one required identity condition and one inspection profile are attached. Learners:

1. Identify which facts are supplied by network fields versus identity or application context.
2. Evaluate each fixture through parsing/normalization, zone, ordered network rule, identity/application conditions, inspection profile, and final decision.
3. Distinguish allow, deny, and review-required; cite the first failed condition.
4. Repair one narrowly scoped policy error, keeping default deny and logging a decision reason.
5. Compare a tuple-only decision with a context-aware decision and state visibility limits.

### Deterministic processing order

1. Validate fixture shape and normalize declared fields.
2. Resolve ingress/egress zones.
3. Evaluate network rules by first-match semantics; unmatched means deny.
4. Evaluate required identity and application context; missing required context fails closed to the configured deny/review outcome.
5. Apply the attached inspection fixture: `clear`, `block`, or `review` with declared confidence.
6. Final precedence: explicit network deny → deny; required identity failure → deny; inspection `block` → deny; inspection `review` → review (not allow); otherwise allow only if all required conditions passed.
7. Produce a structured reason with stage, policy ID, and fixture ID. No answer key or hidden expected result appears before attempt submission.

### Expected outcomes, scoring, and safety

Score 100: stage identification 20; five fixture decisions 40; first-failed-condition explanations 15; least-privilege repair 15; limitations and evidence statement 10. Configured pass score applies. A stage result is simulated data and never described as a real inspection, malware scan, or user authentication event.

Hints reveal the stage definitions and one trace at a time. Failure conditions: allowing a block fixture, treating review as allow, or bypassing a failed identity condition with a global allow. Learner can reset and retry.

### Instructor solution and reset

Instructor key: tuple-only data cannot establish user identity or a specific application; only the supplied fixture can. Deny wrong identity and inspection block; hold review-required for review; allow only the fixture that satisfies zone, first-match network policy, required context, and clear inspection result. Keep unknown classification denied or in review per configured policy. Reset restores the original rules and fixture queue, clears only this attempt, and records an attempt boundary. Completion requires every fixture decision correct, the policy repair validated by positive and negative tests, and a passing score.

## Lab execution workflow

```mermaid
flowchart TD
  A[Open configured lab] --> B[Load immutable fixture and version]
  B --> C[Create scoped attempt]
  C --> D[Render scenario and tasks]
  D --> E[Accept only declared lab inputs]
  E --> F[Run deterministic validation]
  F --> G{All validations complete?}
  G -->|No| H[Show task-specific result and hint]
  H --> E
  G -->|Yes| I[Calculate server-trusted score]
  I --> J{Pass threshold met?}
  J -->|Yes| K[Record completion and evidence]
  J -->|No, retry allowed| L[Record failed attempt]
  L --> M[Reset to immutable starting state]
  M --> C
```
'''

files['ASSESSMENTS.md'] = r'''# Day 1 Assessment Specification

## Inventory and mapping

- **Concept checks:** 240 items total, five per each of the 48 concept IDs.
- **Session assessments:** 80 items total, 20 per each of the four supplied session IDs.
- **Day 1 final:** 40 items total, ten per session, with concept coverage distributed across that session's 12 concepts.
- Initial pass threshold: 70%, matching the existing programme seed, configurable per programme.
- The JSON records these counts and stable session/concept IDs. This package includes authored sample questions below; it does not claim to include a reviewed 360-question production bank. The remaining bank-authoring and instructor review is a content task, not a reason to fill the bank with generated placeholders.

## Formats and scoring

| Format | Concept check | Session | Final | Scoring requirement |
| --- | --- | --- | --- | --- |
| Single-best-answer | Yes | Yes | Yes | Exact correct option; one point or normalized weight. |
| Multi-select | Yes | Yes | Yes | State exact-match or partial-credit rule before start; no undisclosed negative marking. |
| Ordered sequence | When concept supports it | Yes | Yes | Correct order rubric; partial credit only if explicitly configured. |
| Scenario response | Short response/rubric | Yes | Yes | Instructor-reviewed or deterministic rubric with criteria and audit trail; do not imply automated semantic judgment unless implemented and validated. |

Each question has stable ID, type, prompt, options or response schema, correct-answer key/rubric, explanation, linked concept ID(s), session ID, difficulty, points, publication status, and version. Correct keys remain in a trusted scoring boundary and are omitted from learner response payloads until the attempt is closed.

## Attempt, mastery, retry, and feedback rules

- A learner must have access to the assessment's programme and session; a published assessment is not public just because its course content is public.
- Default attempt limit: 3 per assessment, configurable by an authorized instructor. No hidden unlimited retries. If a pilot chooses unlimited retries, make it explicit and retain all attempts.
- One active attempt per learner and assessment; server assigns attempt number and timestamps. Duplicate submissions are idempotent by attempt ID.
- Score is points earned divided by points possible, rounded to the nearest whole percent. Pass at configured threshold. Store raw answers, score, pass, question version, and submission timestamp. For privacy, do not put answer keys into a browser-visible config or logs.
- Before submission, show selected answers and unanswered items; permit changes until final submit. After submission, show correct answer, explanation, concept link, score, and pass/retry state according to publication policy.
- Mastery for a concept is a passed concept check. Session mastery requires its session test pass; final mastery requires the final threshold. Reattempt results do not erase prior attempts; the programme must declare whether unlock uses latest or best attempt (default: latest attempt for current mastery, retain best as history).
- Do not mark a session complete on assessment submission alone if required concepts/lab tasks remain incomplete.

## Assessment workflows

### Concept check

One five-question pool is assigned to each concept. Each check draws questions from that concept's own five authored items. For predictable grading in the first version, use all five in a stable order or a reproducible selection keyed to attempt; never present the answer key in the learner's initial payload. Minimum score and retry rule are configured.

### Session assessment

Each session has 20 authored items mapped to its 12 concepts. A delivered assessment can use a declared deterministic selection (e.g. 10 of 20) only if the product supports it and the instructor knows the selection rule. The question-bank inventory remains 20 per session regardless of delivery length. For initial implementation, deliver all 20 in the authored order to avoid ambiguous randomization.

### Final assessment

The 40-item bank contains ten items from each session. Deliver all 40 for the first version. Report results by session/concept cluster only after submission. A passing final does not bypass programme completion rules or required lab completion.

## Concrete sample items and answer keys

These samples are authored against the supplied Day 1 scope. Keep answers hidden until submission in the actual learner flow.

### Concept check samples

**C1 — Threat, vulnerability, exploit, and risk (single best answer).** A device has a documented weakness, but the device is on an isolated training subnet and no exploit evidence is present. Which conclusion is best supported?  
A. The system is confirmed compromised.  
B. A vulnerability exists; exposure and risk still require context.  
C. The threat actor is identified.  
D. The weakness is an exploit.  
**Answer: B.** A weakness is not evidence of exploitation; reachability, impact, and compensating controls inform risk.

**C2 — IPv4 prefix (single best answer).** Which network contains `10.24.8.37/24`?  
A. `10.24.8.0/24`  B. `10.24.0.0/24`  C. `10.24.8.37/32`  D. `10.24.9.0/24`  
**Answer: A.** The first 24 bits identify `10.24.8.0/24`.

**C3 — TCP endpoint (single best answer).** In a client flow to a documented HTTPS listener, which field normally identifies the server's requested service endpoint?  
A. Client ephemeral source port  B. Destination TCP port 443  C. Client MAC address  D. Firewall rule order  
**Answer: B.** Destination transport port is the service endpoint hint; it does not prove the application identity.

**C4 — Stateful inspection (single best answer).** Why can a stateful policy admit a matching reply without a broad server-to-client allow rule?  
A. The reply's source address is trusted by default.  B. It matches a previously permitted tracked flow.  C. TCP encrypts the return packet.  D. The port number authenticates the user.  
**Answer: B.** The policy decision is based on tracked exchange context and matching state.

**C5 — NGFW decision (scenario, single best answer).** A fixture is authorized by its network tuple but the required identity context is missing. The policy is configured to require identity. What should the simulator do?  
A. Allow because the port matches.  B. Deny or hold for review according to the declared missing-context policy.  C. Mark identity as verified.  D. Skip every remaining stage.  
**Answer: B.** Network reachability does not satisfy a required identity condition.

### Session assessment samples

**S1 — Session 1, threat mapping (multi-select).** Which fields keep a threat record auditable and useful?  
A. Asset and owner  B. Evidence and confidence  C. Control and verification  D. Unverified actor attribution as fact  
**Answers: A, B, C.** Record facts, uncertainty, ownership, and testable action; do not present unsupported attribution as fact.

**S2 — Session 2, rule engineering (single best answer).** In this lab's first-match model, a broad allow precedes a narrow deny and both match the same flow. Which action applies?  
A. The last matching rule.  B. The first matching rule.  C. Both actions cancel.  D. The implicit deny always applies first.  
**Answer: B.** Evaluation stops at the first fully matching ordered rule.

**S3 — Session 3, stateful flow (sequence).** Order the simplified handshake: `SYN`, `SYN-ACK`, `ACK`.  
**Answer:** Initiator `SYN` → responder `SYN-ACK` → initiator `ACK`.  
**Explanation:** The declared teaching model transitions to established only after a matching final ACK.

**S4 — Session 4, NGFW (single best answer).** A deterministic inspection fixture returns `review`. The published precedence says review is not allow. What is the outcome?  
A. Allow silently.  B. Review, with stage and reason recorded.  C. Delete the rule.  D. Treat it as a real malware scan.  
**Answer: B.** A simulated review result remains a review outcome and must not be presented as real inspection.

### Day 1 final samples

**F1 — Threat prioritization (single best answer).** Which item should be validated first when deciding whether a management exposure is urgent?  
A. A dramatic alert name alone.  B. Confirmed reachability, asset impact, and evidence.  C. An assumed actor identity.  D. The number of dashboard colors.  
**Answer: B.** Exposure, business impact, and evidence ground prioritization.

**F2 — Rule policy (single best answer).** A required user-to-reporting flow uses TCP/443 to one service. Which rule is most least-privilege?  
A. Any source to any destination, any protocol.  B. User zone to the named service host, TCP destination 443, documented owner.  C. All external hosts to the admin zone.  D. Permit all traffic after one successful test.  
**Answer: B.** Scope should match the documented endpoints and service requirement.

**F3 — Routing and state (scenario, single best answer).** A firewall sees a permitted request but not its reply, which returns through another device. What should be examined first?  
A. Add an any-any reverse rule.  B. Validate both route paths and where session state is observed.  C. Assume the server is compromised.  D. Disable state tracking globally.  
**Answer: B.** Asymmetry can prevent association with the initiating flow; validate architecture before changing scope.

**F4 — NGFW context (multi-select).** Which statements are correct?  
A. A port is not definitive proof of application identity.  B. A missing required identity signal must follow configured policy.  C. A simulator fixture proves a live malware scan occurred.  D. Inspection results need an explainable stage and outcome.  
**Answers: A, B, D.** Port, identity, and inspection evidence have distinct limits; the lab's fixtures are simulation only.

## Validation and acceptance of assessment data

Reject a bank on import if IDs are duplicate; counts do not match 5×48, 20×4, and 10×4; a concept/session reference is missing; correct option is out of range; multi-select has no scoring rule; rubric has no maximum points; published question includes no explanation; or answer keys are included in the learner projection. Run exact inventory checks in content CI or the import validator. Instructor preview should reveal keys only to a verified instructor role. Keep an audit record for edits to question text, key, rubric, and publication state.
'''

files['DATA_MODEL.md'] = r'''# Day 1 Data Model and Contracts

## Repository facts and constraints

The repository defines a normalized PostgreSQL schema in `supabase/migrations/20261115000001_initial_schema.sql`, seed data in `20261115000002_seed_initial_programme.sql`, RLS in `20261115000003_rls_policies.sql`, and role definitions in `20261115000004_auth_and_roles.sql`; `supabase/init_full_schema.sql` is a consolidated script. Do not add parallel tables or hand-edit migrations. Root `AGENTS.md` reserves schema changes to Lovable-managed tooling. First verify which schema is actually deployed and use managed schema workflows for an approved change.

The schema already has `programmes`, `programme_days`, `programme_sessions`, `programme_labs`, `programme_assessments`, `programme_resources`, `learner_session_progress`, `learner_lab_progress`, `session_attendance`, `assessment_attempts`, `learner_simulation_state`, and `user_roles`. Existing columns include JSONB assessment answers, session completion timestamps, lab checklist keys, and user/role identifiers. Reuse appropriate records; do not create duplicate programme/session/lab/assessment entities.

The application code currently persists a broad state object in browser localStorage and has no app auth/client module in the inspected `src/`. The SQL role table and policy functions are not proof that auth is connected to the running app. The RLS script allows the shared anonymous `local-learner` identity for guest progress; that is unsuitable as a multi-learner identity. The public read policy for published `programme_assessments` should not expose answer keys for a real assessment bank.

## Existing entities to reuse

| Need | Existing entity | Existing shape / caution |
| --- | --- | --- |
| Programme/day/session | `programmes`, `programme_days`, `programme_sessions` | Normalized keys and ordered rows already match programme config. Preserve current IDs for Day 2–Day 5. |
| Lab definitions | `programme_labs` | Title, day, instructions, checklist. The detailed deterministic lab engine contract exceeds current static checklist fields; keep authored lab specification/data centrally and add state only after schema review. |
| Assessment definitions | `programme_assessments` | Prompt, options, answer, order; current public-read policy exposes rows from published courses. Do not place unreleased keys in the learner-readable definition path. |
| Session completion | `learner_session_progress` | Composite user/programme/session identity and timestamp. Validate identity and current session before write. |
| Lab checklist state | `learner_lab_progress` | Currently stores one checkbox key/value, not a scored task submission. Do not overload it with attempt history. |
| Attendance | `session_attendance` | Staff-only policy exists in role migration; verify role and current deployed policies before use. |
| Assessment attempts | `assessment_attempts` | Stores score and answers JSONB, but lacks explicit assessment type, assessment ID, attempt number, pass state, and question-version contract. Avoid duplicate attempts by idempotency key in service behavior; schema evolution needs review. |
| Simulation controls | `learner_simulation_state` | Stores three simple flags; it is not a firewall configuration or live VM state. Keep Day 1's richer state isolated by lab/attempt. |
| Staff roles | `user_roles` | `student`, `instructor`, `administrator`; server-side role check required. The project currently lacks a verified sign-in flow. |

## Configuration as source of truth

`src/lib/training-platform.ts` is the current central configuration model. Extend it with versioned Day 1 content or a typed import from `docs/day1/data/day1-curriculum.json`. The application should not fetch or duplicate Day 1 names/counts in multiple views. Validate imported config atomically before updating the active programme. Keep session order and Day 1 schedule fields aligned with the existing programme IDs and seed.

For content authored in the repository, stable IDs in the JSON are the canonical import IDs. A proposed `concept` record contains: ID, session ID, ordering number, title, objectives, instructional fields, prerequisites, suggested duration, and lab references. `assessment` records need type, session/concept mapping, version, prompt, choices or rubric, points, explanation, publication status, and answer key with access restricted before submission. Lab definition records carry a fixture version and deterministic validator contract; attempts record results separately.

## Required learner records and ownership

- **Concept progress:** one per authenticated learner, programme, concept, with status, started/completed timestamps, check result reference, and content version. Unique key by learner/programme/concept; ignore removed IDs in current progress totals.
- **Assessment attempt:** reuse `assessment_attempts` only if the deployed schema and authorization model support required scope and idempotency. Persist learner ID, programme, assessment type and ID, attempt number, question-bank version, answers, score, pass, submitted timestamp. Do not write answer keys into learner records.
- **Lab attempt/submission:** require attempt ID, lab/config version, learner, attempt number, selected configuration, task results, score/pass, start/submit times, and reset boundary. Existing checklist state is not equivalent to this history.
- **Session progress:** reuse `learner_session_progress` after the configured completion rule passes; session status must be calculated from concept, assessment, and required-lab states.
- **Instructor access:** role-based access to cohorts and audit records must be explicit. Current schema does not define cohort enrollment or learner-to-instructor assignment; do not invent one. Until product requirements define enrollment scope, only authorized administrator-wide reporting or self-only learner access should be specified.

Potential new schema capabilities (concept records/progress and lab attempt history, assessment scope and attempt fields) are requirements to evaluate, not approved table names or migrations. Prefer versioned curriculum configuration in repository and reuse existing progress/attempt entities where they fit. If durable multi-user progress requires schema changes, request the managed backend/schema workflow and review RLS/grants before implementing.

## Proposed service contracts (logical, not existing APIs)

These are payload boundaries for future implementation, not current endpoints or route names:

- `loadDay1Curriculum(programmeId, dayId)` returns published lesson content with stable IDs and no answer keys.
- `saveConceptProgress(conceptId, status, checkAttemptId)` accepts only the authenticated learner's own record; server validates programme/session/prerequisites.
- `startAssessment(type, assessmentId)` returns eligible question prompt/version data with answer keys omitted.
- `submitAssessment(attemptId, responses)` validates ownership, attempt state, question version, response shape, and attempt rules; trusted scorer returns result and post-submit feedback.
- `startLab(labId)` creates an attempt from a server-controlled immutable fixture version; `submitLab(attemptId, responses)` computes task outcomes from that fixture, not client score.
- `loadInstructorProgress(scope)` requires a verified instructor/administrator role and an explicitly authorized learner scope.

Do not implement these as unauthenticated `/api/public/*` handlers returning learner records. If server logic is added, use the project's TanStack server-function conventions and authenticated middleware; public endpoints require their own caller verification.

## Validation and authorization

Validate IDs, foreign references, count constraints, unique ordering, date/time format, bounded duration, score 0–100, option indexes, answer schema, attempt ownership, and configuration version. RLS policies must match intended operation for each table; table grants are separate from RLS. Verify least privilege and deny-by-default grants. Roles cannot be trusted from client metadata; check the authoritative role row/function on the server. Do not use privileged admin clients to decide whether a caller is staff.

### Relationship diagram

```mermaid
erDiagram
  programmes ||--o{ programme_days : contains
  programme_days ||--o{ programme_sessions : schedules
  programme_days ||--o{ programme_labs : offers
  programmes ||--o{ programme_assessments : defines
  programmes ||--o{ programme_resources : references
  programmes ||--o{ learner_session_progress : tracks
  programmes ||--o{ learner_lab_progress : tracks
  programmes ||--o{ assessment_attempts : records
  programmes ||--o{ learner_simulation_state : scopes
  programme_sessions ||--o{ learner_session_progress : completed_by
  programme_sessions ||--o{ session_attendance : attended_by
  user_roles ||--|| auth_users : identifies
  programmes ||--o{ day1_concept_config : config_only
  day1_concept_config ||--o{ day1_concept_progress : proposed_progress
  programmes ||--o{ day1_lab_attempt : proposed_attempts
```

`day1_concept_config`, `day1_concept_progress`, `day1_lab_attempt`, and `auth_users` in the diagram are logical placeholders, not inspected table names. No migration is supplied. Existing FKs/policies should be checked in the deployed schema before any implementation.

## Persistence and migration plan

1. First version of this package ships JSON curriculum content and local/demo progress only if no authenticated backend is enabled; display the local-only limitation.
2. For production persistence, verify managed backend connectivity, current schema, applied migrations, auth state, and RLS/grants. Do not infer the deployed schema from checked-in SQL.
3. Map concepts to stable config IDs and reuse existing entities when the deployed schema matches. Propose only the minimum managed schema evolution after checking existing constraints and policy behavior.
4. Backfill no fictional learner records. Preserve existing progress; provide an explicit migration/version policy for concept removal and content edits.
5. Verify read/write access as anonymous, learner, instructor, and administrator; verify one learner cannot read or write another learner's progress or submissions.
'''

files['IMPLEMENTATION_PLAN.md'] = r'''# Repository-Specific Implementation Plan

## Baseline inspected

- `/` is defined in `src/routes/index.tsx`; the route mounts `src/components/training-platform-app.tsx`. The generated route tree is `src/routeTree.gen.ts`; do not edit it manually.
- `src/lib/training-platform.ts` holds programme/session/day/lab/question/state types and the initial five-day programme. Keep this as the content source of truth.
- The app component owns current view state and actions; its views already cover Schedule, Learning Modules, Virtual Lab, Assessments, Progress, Instructor Console, and Administration.
- `src/styles.css` holds existing semantic tokens and styles; use those tokens and current responsive breakpoints.
- Browser state is stored under `shadowxlab-training-state-v1` in localStorage. SQL files describe a normalized schema and role policies; app-level auth/client integration was not found in `src/`.
- Dependencies already include React 19, TanStack Start/Router, lucide-react, zod, react-hook-form, shadcn/Radix UI components, and Vitest. Add no dependency until a concrete gap exists.

## Files to modify or create when implementing

The only files this documentation task creates are under `docs/day1/`. For a later app implementation, likely targets are:

- Modify `src/lib/training-platform.ts` for typed curriculum schema/import validation and a migration-safe progress model.
- Modify/extract focused pieces from `src/components/training-platform-app.tsx` for session concept disclosure, concept learning, lab attempts, assessment attempts, progress, and instructor presentation.
- Modify `src/styles.css` only for styles not already provided by semantic tokens and existing patterns.
- Add unit tests beside current `src/test/app-routing.test.tsx`, for example a dedicated content validation or scoring test under `src/test/`; exact names are proposed, not existing files.
- No new route is needed for the in-place workflow. If implementation later adds a path, add the TanStack file route and generated route tree through the normal generator, not by hand.
- Do not alter `supabase/migrations/*` or `supabase/init_full_schema.sql` directly. Schema changes are controlled by root `AGENTS.md` and require managed workflow.

## Existing components and behavior to reuse

Reuse the current `ScheduleView` day tabs/session rows, `ModulesView` selected-day pattern, `LabView` topology and simulation notice, `AssessmentsView` question rendering, `ProgressView`, and `InstructorView`. Reuse the current Button/Input/Textarea and card/heading patterns. Keep session IDs `d1-s1` through `d1-s4`, day ID `day-1`, current 10:00–17:00 timetable, and IDs for other days untouched. The existing quiz is only a demo with client-side answer keys; replace/extend only through an approved trusted scoring path for production assessment.

## Implementation order

1. **Configuration contract:** import curriculum JSON type; validate exact 48 concepts, 12/session, four lab references, session ordering/time consistency, unique IDs, prerequisite and lab references. Reject invalid file before state mutation.
2. **Content navigation:** expand Day 1 session with its 12 concepts; add focused concept reader and next/previous navigation, keeping selected programme/day/session stable.
3. **Progress calculation:** define concept/session/day denominator rules; exclude stale IDs; preserve existing untouched seeded progress behavior without treating its 42% as Day 1 concept achievement.
4. **Labs:** implement deterministic, fixture-bound state machines, explicit reset, scoped attempt status, testable validators, visible simulation-only label, and no arbitrary network destination input.
5. **Assessments:** author and validate question inventory; separate prompt delivery from answer keys; implement trusted scoring/persistence before claiming multi-user or secure assessment. If no verified auth/storage exists, label as local demonstration and do not expose it as confidential production assessment.
6. **Instructor access:** verify role and learner scope before adding controls or records. Never rely on hidden buttons or localStorage as access control. If identity and enrollment scope remain undefined, leave instructor learner records explicitly unimplemented rather than inventing access.
7. **Responsive/accessibility:** preserve current nav, add keyboard/accessibility support, test narrow and desktop widths, and honor reduced motion.
8. **Regression and content checks:** run `bunx vitest run` for relevant tests; run import/data invariant checks; manually verify existing programme CRUD, schedule, dashboard, and Day 2–Day 5 remained intact.
9. **Persistence only after approval:** inspect deployed schema, auth, grants, and RLS through managed tooling. No guessed migration or local SQL application.

## Architecture diagram

```mermaid
flowchart LR
  C[day1-curriculum.json] --> V[Configuration validator]
  V --> M[src/lib/training-platform.ts model]
  M --> S[Existing Schedule and Modules views]
  M --> L[Existing Lab view plus deterministic lab engine]
  M --> A[Assessment UI without answer keys]
  A --> T[Trusted scorer when authenticated backend is configured]
  P[Existing localStorage demo state] --> U[Progress UI, local-only disclosure]
  T --> R[Authorized learner attempt records]
  R --> U
  I[Verified instructor role and learner scope] --> X[Instructor controls and reporting]
```

## Dependencies and technical risks

- **No verified backend/auth client:** SQL files alone do not create an app connection. Production ownership, assessment secrecy, and multi-user progress require an approved managed backend integration.
- **Answer-key exposure:** existing quiz configuration exposes `answer`; published SQL assessment rows are publicly readable under existing policy. Do not reuse that path for confidential assessment without fixing data projection and authorization.
- **Shared anonymous identity:** `local-learner` is not an individual learner. Do not report it as authenticated progress.
- **Schedule capacity:** one dedicated Day 1 lab session exists but four labs were requested; only two labs fit that block without changing supplied times. Keep the remaining two self-paced/embedded unless the instructor changes the schedule.
- **File size/maintainability:** current app view file is large. Prefer focused extraction only if implementation work requires it; preserve one shared model and do not create duplicate engines.
- **Content validation:** exact concept/question counts and every reference must be checked before import.

## Testing strategy

- Unit tests: curriculum shape and referential integrity; exactly 48 concepts and 12 per session; rules for completion denominators; stateless first-match and implicit deny; TCP state transitions and invalid tuple; NGFW result precedence; assessment score/attempt rules.
- Security tests: learner projection contains no answer key; role-gated actions reject guest/student callers; learner A cannot read learner B's progress; duplicate submit is idempotent.
- Integration tests: session selection → concept completion → lab attempt → session assessment → progress read-back; failure/retry/reset; imported configuration round-trip; local-only disclosure when backend absent.
- Regression tests: run existing route test plus application tests; verify programme CRUD/import/export, Day 2 dashboard and all five day tabs, mobile nav, and style build.
- Browser checks: 1280px and 375px viewports, keyboard-only path, long titles, loading/error/save failure states, reduced-motion preference.

## Definition of done

- Curriculum import validates 4 sessions, 48 unique concepts (12 each), and all lab references with no duplicate or orphan IDs.
- Each concept has all required instructional sections and display navigation remains in-session.
- Four labs produce deterministic, explainable results and never touch real infrastructure.
- Question counts and mappings validate; answer keys are absent from learner payload until submission.
- Progress and completion use active config and authorized learner records; no fake cross-user persistence.
- No Day 2–Day 5 content/schedule changes; existing navigation and views work.
- Access-denied and failed-save states are covered; UI is responsive and keyboard accessible.
- Tests/build pass; content owner approves all new question bank items and lab answer keys.
'''

files['ACCEPTANCE_TESTS.md'] = r'''# Day 1 Acceptance Tests

Run these against the actual app implementation; a written specification alone does not pass them. Use seeded Day 1 IDs, but avoid asserting styling snapshots.

## Curriculum and schedule

- [ ] Load Day 1 and confirm title, supplied day title, and all four session titles, start/end times, order, and kinds match `data/day1-curriculum.json` and the existing seed.
- [ ] Confirm Day 1 shows exactly 48 unique concept IDs, exactly 12 in each session, with no concept from Day 2–Day 5.
- [ ] Confirm every concept references an existing session; every `recommendedLab` ID resolves; all prerequisites resolve; no duplicate IDs or order numbers.
- [ ] Expand/collapse each session by mouse and keyboard; `aria-expanded` and accessible name match the actual state.
- [ ] Open the first, middle, and last concept of each session; next/previous never crosses the session without an explicit session action.
- [ ] Validate import/export round-trip and reject missing fields, wrong counts, duplicate IDs, broken references, malformed dates/times, and out-of-range assessment values atomically.
- [ ] Confirm selected programme/day/session remains stable when navigating from Dashboard → Schedule → concept → Lab → Progress.

## Instructional content

- [ ] For each of 48 concepts, verify objective, technical explanation, workflow, enterprise example, engineering relevance, instructor note, common mistakes, knowledge-check objective, diagram spec, lab link, prerequisites, and duration are present.
- [ ] Verify all 48 concepts stay within supplied Day 1 scope; no external identity, unrelated course, live appliance instruction, or fake integration appears.
- [ ] Confirm long titles and explanation sections wrap at 320px without clipping or page-level horizontal scrolling.
- [ ] Confirm diagram specifications have an equivalent text description and do not imply an unavailable image exists.

## Labs and simulation safety

- [ ] Confirm exactly four named labs and their session/concept references.
- [ ] Verify each lab displays scenario, objectives, environment, topology, initial state, instructions, tasks, expected outcomes, validation, scoring, hints, failure conditions, instructor solution (authorized only), reset, and completion rules.
- [ ] Lab 02: test first-match rule ordering, shadowing, explicit allow/deny, implicit deny, CIDR, protocol, inclusive port range, and malformed-input rejection.
- [ ] Lab 03: test SYN → matching SYN-ACK → ACK; reject wrong tuple/unmatched ACK/unsolicited response; test established reply, FIN, RST, expiry, capacity, and asymmetric path.
- [ ] Lab 04: test each declared pipeline stage; block and review precedence; missing required identity; unknown application; no “review” result becomes allow.
- [ ] Reset returns the selected lab to its declared initial state and does not erase another lab's attempts or programme progress.
- [ ] Visible wording says simulation-only; network inspection confirms no real packet, host, appliance, or VM request is made by lab interactions.

## Assessments

- [ ] Inventory validator confirms 240 concept questions = 5 × 48; 80 session questions = 20 × 4; 40 final questions = 10 × 4 sessions.
- [ ] Every question maps to valid concept/session IDs, valid option/rubric, points, explanation, version, and publication state.
- [ ] Validate each sample answer and explanation in `ASSESSMENTS.md` against its stated correct answer.
- [ ] Learner response payload before submission contains no correct index, answer key, or hidden expected lab result.
- [ ] Correct, incorrect, unanswered, duplicate-submit, retry-limit, multi-select scoring, and final-score rounding behaviors are deterministic.
- [ ] After submission, feedback references the linked concept and honors the configured attempt/publication policy.
- [ ] A failed session assessment does not mark the session complete; configured pass score does.

## Progress, persistence, instructor controls

- [ ] Complete one concept and verify Day 1 numerator increases by exactly one; revisit does not double-count.
- [ ] Attempt incomplete prerequisite and verify no completion; complete prerequisite and retry.
- [ ] Verify zero-concept denominator, all-concepts completion, removed/stale IDs, and edits do not inflate the percentage.
- [ ] Session completion requires the configured concepts, assessment, and required labs; verify each configuration switch.
- [ ] For authenticated persistence, refresh and sign in as the same learner; verify saved concept, attempt, lab, and session data reads back.
- [ ] Verify learner A cannot read or change learner B's records; anonymous `local-learner` is never presented as a unique person.
- [ ] Verify guest and student cannot invoke instructor controls even if a request is crafted directly; instructor scope is explicitly authorized.
- [ ] On failed persistence, show an unsynced status, retain recoverable input where safe, and provide retry. Never display a false saved confirmation.
- [ ] Instructor content and answer key preview is unavailable to learner role; authorized edits produce a version/audit record.

## Regression and responsive behavior

- [ ] Existing programme create/edit/duplicate/archive/select/import/export still works.
- [ ] Existing Day 2–Day 5 titles, dates, sessions, labs, and assessment remain unchanged.
- [ ] Dashboard KPIs, roadmap, topology, and upcoming-session links still derive from programme configuration.
- [ ] Existing route test (`src/test/app-routing.test.tsx`) passes; run all related Vitest tests.
- [ ] Desktop 1280px: schedule expansion, concept panel, lab view, assessment, progress, and instructor view are non-overlapping.
- [ ] Mobile 320px and 375px: no clipped buttons or content, navigation usable, assessment submission reachable, touch controls stable.
- [ ] Keyboard-only: navigation, accordion, concept index, forms, lab tasks, and assessment are operable; focus is visible and status changes are announced.
- [ ] Reduced motion removes nonessential animation; color is never the sole status signal.
- [ ] Build succeeds and browser console has no runtime errors.
'''

for name, content in files.items():
    (root / name).write_text(content.strip() + '\n', encoding='utf-8')

print(f'Wrote {len(files) + 1} blueprint files; {len(sessions)} sessions; {len(concepts)} concepts; {sum(len(s["conceptRange"]) for s in sessions)} range values; {len(curriculum["day"]["labs"])} labs.')
