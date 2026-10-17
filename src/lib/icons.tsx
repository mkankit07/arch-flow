import { createElement } from "react";
import type { IconType } from "react-icons";
import { FaAws, FaMicrosoft } from "react-icons/fa6";
import {
  LuActivity,
  LuArchive,
  LuBell,
  LuBot,
  LuBox,
  LuBoxes,
  LuBrain,
  LuCalendar,
  LuChartBar,
  LuCloud,
  LuCode,
  LuContainer,
  LuCpu,
  LuCreditCard,
  LuDatabase,
  LuFileText,
  LuFolder,
  LuGitBranch,
  LuGlobe,
  LuHardDrive,
  LuImage,
  LuInbox,
  LuKey,
  LuLaptop,
  LuLayers,
  LuListOrdered,
  LuLock,
  LuMail,
  LuMapPin,
  LuMessageSquare,
  LuMonitor,
  LuNetwork,
  LuRadio,
  LuRouter,
  LuScale,
  LuSearch,
  LuServer,
  LuSettings,
  LuShield,
  LuShieldCheck,
  LuShoppingCart,
  LuSmartphone,
  LuSplit,
  LuTablet,
  LuTerminal,
  LuTimer,
  LuUser,
  LuUsers,
  LuVideo,
  LuWebhook,
  LuWifi,
  LuWorkflow,
  LuZap,
} from "react-icons/lu";
import {
  SiAndroid,
  SiAnthropic,
  SiApachecassandra,
  SiApachekafka,
  SiApachespark,
  SiApple,
  SiAuth0,
  SiCloudflare,
  SiDatadog,
  SiDjango,
  SiDocker,
  SiElasticsearch,
  SiFirebase,
  SiGithub,
  SiGithubactions,
  SiGo,
  SiGooglecloud,
  SiGrafana,
  SiGraphql,
  SiJenkins,
  SiKubernetes,
  SiMongodb,
  SiMysql,
  SiNextdotjs,
  SiNginx,
  SiNodedotjs,
  SiOkta,
  SiPostgresql,
  SiPrometheus,
  SiPython,
  SiRabbitmq,
  SiReact,
  SiRedis,
  SiSnowflake,
  SiSpringboot,
  SiStripe,
  SiSupabase,
  SiTerraform,
  SiTypescript,
  SiVercel,
} from "react-icons/si";

export type IconDef = {
  id: string;
  label: string;
  category: IconCategory;
  Icon: IconType;
  color: string;
  keywords?: string;
};

export const ICON_CATEGORIES = [
  "Clients",
  "Compute",
  "Data",
  "Networking",
  "Messaging",
  "Security",
  "DevOps",
  "Business",
  "Cloud & Tech",
] as const;

export type IconCategory = (typeof ICON_CATEGORIES)[number];

const C = {
  clients: "#0ea5e9",
  compute: "#f97316",
  data: "#2563eb",
  network: "#8b5cf6",
  messaging: "#db2777",
  security: "#16a34a",
  devops: "#0d9488",
  business: "#ca8a04",
};

const generic = (
  id: string,
  label: string,
  category: IconCategory,
  Icon: IconType,
  color: string,
  keywords?: string,
): IconDef => ({ id, label, category, Icon, color, keywords });

export const ICONS: IconDef[] = [
  // Clients
  generic("user", "User", "Clients", LuUser, C.clients, "person actor customer"),
  generic("users", "Users", "Clients", LuUsers, C.clients, "people actors team"),
  generic("browser", "Web Browser", "Clients", LuGlobe, C.clients, "web client frontend spa"),
  generic("mobile", "Mobile App", "Clients", LuSmartphone, C.clients, "phone ios android"),
  generic("desktop", "Desktop", "Clients", LuMonitor, C.clients, "pc screen"),
  generic("laptop", "Laptop", "Clients", LuLaptop, C.clients, "computer"),
  generic("tablet", "Tablet", "Clients", LuTablet, C.clients, "ipad"),
  generic("iot", "IoT Device", "Clients", LuWifi, C.clients, "sensor device edge"),

  // Compute
  generic("server", "Server", "Compute", LuServer, C.compute, "host vm instance ec2 backend"),
  generic("service", "Service", "Compute", LuBox, C.compute, "microservice app api"),
  generic("cluster", "Cluster", "Compute", LuBoxes, C.compute, "pods nodes group"),
  generic("container", "Container", "Compute", LuContainer, C.compute, "docker pod"),
  generic("function", "Function", "Compute", LuCode, C.compute, "lambda serverless faas"),
  generic("worker", "Worker", "Compute", LuCpu, C.compute, "job processor background"),
  generic("cron", "Scheduler", "Compute", LuTimer, C.compute, "cron job timer batch"),
  generic("workflow", "Workflow", "Compute", LuWorkflow, C.compute, "orchestration step functions pipeline"),
  generic("cli", "CLI / Script", "Compute", LuTerminal, C.compute, "terminal shell"),
  generic("ml-model", "ML Model", "Compute", LuBrain, C.compute, "ai llm inference"),
  generic("agent", "AI Agent", "Compute", LuBot, C.compute, "bot llm assistant"),

  // Data
  generic("database", "Database", "Data", LuDatabase, C.data, "sql rds db store"),
  generic("cache", "Cache", "Data", LuZap, C.data, "redis memcached in-memory"),
  generic("storage", "Block Storage", "Data", LuHardDrive, C.data, "disk volume ebs"),
  generic("object-storage", "Object Storage", "Data", LuArchive, C.data, "s3 blob bucket gcs"),
  generic("warehouse", "Data Warehouse", "Data", LuLayers, C.data, "olap redshift bigquery lake"),
  generic("search", "Search Index", "Data", LuSearch, C.data, "elasticsearch opensearch"),
  generic("files", "File System", "Data", LuFolder, C.data, "nfs efs folder"),
  generic("document", "Document", "Data", LuFileText, C.data, "file report"),
  generic("analytics", "Analytics", "Data", LuChartBar, C.data, "metrics bi dashboard"),
  generic("media", "Media", "Data", LuImage, C.data, "image asset"),
  generic("video", "Video", "Data", LuVideo, C.data, "stream media"),

  // Networking
  generic("internet", "Internet", "Networking", LuGlobe, C.network, "www public"),
  generic("cdn", "CDN", "Networking", LuCloud, C.network, "edge cloudfront cache"),
  generic("load-balancer", "Load Balancer", "Networking", LuScale, C.network, "alb elb nlb lb"),
  generic("api-gateway", "API Gateway", "Networking", LuRouter, C.network, "gateway ingress proxy"),
  generic("dns", "DNS", "Networking", LuNetwork, C.network, "route53 domain"),
  generic("router", "Router", "Networking", LuSplit, C.network, "routing traffic split"),
  generic("webhook", "Webhook", "Networking", LuWebhook, C.network, "callback http"),
  generic("cloud", "Cloud", "Networking", LuCloud, C.network, "region vpc"),

  // Messaging
  generic("queue", "Queue", "Messaging", LuListOrdered, C.messaging, "sqs fifo buffer"),
  generic("pubsub", "Pub / Sub", "Messaging", LuRadio, C.messaging, "sns topic broadcast"),
  generic("event-bus", "Event Bus", "Messaging", LuGitBranch, C.messaging, "eventbridge events stream"),
  generic("email", "Email", "Messaging", LuMail, C.messaging, "smtp ses mail"),
  generic("notification", "Notification", "Messaging", LuBell, C.messaging, "push alert"),
  generic("chat", "Chat", "Messaging", LuMessageSquare, C.messaging, "message sms"),
  generic("inbox", "Inbox", "Messaging", LuInbox, C.messaging, "mailbox dead letter dlq"),

  // Security
  generic("auth", "Auth", "Security", LuKey, C.security, "authentication login oauth jwt iam"),
  generic("lock", "Encryption", "Security", LuLock, C.security, "kms secret vault"),
  generic("firewall", "Firewall", "Security", LuShield, C.security, "waf security group"),
  generic("compliance", "Compliance", "Security", LuShieldCheck, C.security, "policy audit"),

  // DevOps
  generic("monitoring", "Monitoring", "DevOps", LuActivity, C.devops, "observability metrics health"),
  generic("config", "Config", "DevOps", LuSettings, C.devops, "settings parameters"),
  generic("ci-cd", "CI / CD", "DevOps", LuGitBranch, C.devops, "pipeline build deploy"),

  // Business
  generic("payments", "Payments", "Business", LuCreditCard, C.business, "billing card checkout"),
  generic("cart", "Cart", "Business", LuShoppingCart, C.business, "shop ecommerce order"),
  generic("calendar", "Calendar", "Business", LuCalendar, C.business, "booking schedule"),
  generic("location", "Location", "Business", LuMapPin, C.business, "map geo"),

  // Cloud & Tech (brand icons)
  generic("aws", "AWS", "Cloud & Tech", FaAws, "#ff9900", "amazon cloud"),
  generic("gcp", "Google Cloud", "Cloud & Tech", SiGooglecloud, "#4285f4", "gcp cloud"),
  generic("azure", "Azure", "Cloud & Tech", FaMicrosoft, "#0078d4", "microsoft cloud"),
  generic("cloudflare", "Cloudflare", "Cloud & Tech", SiCloudflare, "#f38020", "cdn edge"),
  generic("vercel", "Vercel", "Cloud & Tech", SiVercel, "#000000", "hosting"),
  generic("docker", "Docker", "Cloud & Tech", SiDocker, "#2496ed", "container"),
  generic("kubernetes", "Kubernetes", "Cloud & Tech", SiKubernetes, "#326ce5", "k8s"),
  generic("terraform", "Terraform", "Cloud & Tech", SiTerraform, "#7b42bc", "iac"),
  generic("postgresql", "PostgreSQL", "Cloud & Tech", SiPostgresql, "#4169e1", "postgres sql db"),
  generic("mysql", "MySQL", "Cloud & Tech", SiMysql, "#4479a1", "sql db"),
  generic("mongodb", "MongoDB", "Cloud & Tech", SiMongodb, "#47a248", "nosql document db"),
  generic("redis", "Redis", "Cloud & Tech", SiRedis, "#dc382d", "cache"),
  generic("cassandra", "Cassandra", "Cloud & Tech", SiApachecassandra, "#1287b1", "nosql"),
  generic("elasticsearch", "Elasticsearch", "Cloud & Tech", SiElasticsearch, "#005571", "search"),
  generic("snowflake", "Snowflake", "Cloud & Tech", SiSnowflake, "#29b5e8", "warehouse"),
  generic("spark", "Spark", "Cloud & Tech", SiApachespark, "#e25a1c", "big data"),
  generic("kafka", "Kafka", "Cloud & Tech", SiApachekafka, "#231f20", "stream events queue"),
  generic("rabbitmq", "RabbitMQ", "Cloud & Tech", SiRabbitmq, "#ff6600", "queue amqp"),
  generic("nginx", "Nginx", "Cloud & Tech", SiNginx, "#009639", "proxy web server"),
  generic("graphql", "GraphQL", "Cloud & Tech", SiGraphql, "#e10098", "api"),
  generic("nodejs", "Node.js", "Cloud & Tech", SiNodedotjs, "#5fa04e", "javascript backend"),
  generic("python", "Python", "Cloud & Tech", SiPython, "#3776ab", "backend"),
  generic("go", "Go", "Cloud & Tech", SiGo, "#00add8", "golang backend"),
  generic("typescript", "TypeScript", "Cloud & Tech", SiTypescript, "#3178c6", "javascript"),
  generic("springboot", "Spring Boot", "Cloud & Tech", SiSpringboot, "#6db33f", "java backend"),
  generic("django", "Django", "Cloud & Tech", SiDjango, "#092e20", "python backend"),
  generic("react", "React", "Cloud & Tech", SiReact, "#087ea4", "frontend"),
  generic("nextjs", "Next.js", "Cloud & Tech", SiNextdotjs, "#000000", "frontend react"),
  generic("firebase", "Firebase", "Cloud & Tech", SiFirebase, "#dd2c00", "baas"),
  generic("supabase", "Supabase", "Cloud & Tech", SiSupabase, "#3ecf8e", "baas postgres"),
  generic("stripe", "Stripe", "Cloud & Tech", SiStripe, "#635bff", "payments"),
  generic("auth0", "Auth0", "Cloud & Tech", SiAuth0, "#eb5424", "auth identity"),
  generic("okta", "Okta", "Cloud & Tech", SiOkta, "#007dc1", "auth identity sso"),
  generic("anthropic", "Anthropic", "Cloud & Tech", SiAnthropic, "#191919", "claude ai llm"),
  generic("github", "GitHub", "Cloud & Tech", SiGithub, "#181717", "git repo"),
  generic("github-actions", "GitHub Actions", "Cloud & Tech", SiGithubactions, "#2088ff", "ci cd"),
  generic("jenkins", "Jenkins", "Cloud & Tech", SiJenkins, "#d24939", "ci cd"),
  generic("prometheus", "Prometheus", "Cloud & Tech", SiPrometheus, "#e6522c", "metrics monitoring"),
  generic("grafana", "Grafana", "Cloud & Tech", SiGrafana, "#f46800", "dashboard monitoring"),
  generic("datadog", "Datadog", "Cloud & Tech", SiDatadog, "#632ca6", "monitoring apm"),
  generic("apple", "iOS", "Cloud & Tech", SiApple, "#000000", "apple iphone mobile"),
  generic("android", "Android", "Cloud & Tech", SiAndroid, "#34a853", "mobile"),
];

const ICON_MAP = new Map(ICONS.map((i) => [i.id, i]));
const FALLBACK = ICON_MAP.get("service")!;

export function getIcon(id: string | undefined): IconDef {
  return (id && ICON_MAP.get(id)) || FALLBACK;
}

export function searchIcons(query: string, category?: IconCategory | "All"): IconDef[] {
  const q = query.trim().toLowerCase();
  return ICONS.filter((i) => {
    if (category && category !== "All" && i.category !== category) return false;
    if (!q) return true;
    return `${i.label} ${i.id} ${i.keywords ?? ""}`.toLowerCase().includes(q);
  });
}

export function IconGlyph({
  iconId,
  size = 24,
  color,
}: {
  iconId: string | undefined;
  size?: number;
  color?: string;
}) {
  const def = getIcon(iconId);
  return createElement(def.Icon, { size, color: color ?? def.color });
}
