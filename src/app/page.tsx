import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatPrice } from "@/lib/utils";

const vehicleTypeLabels: Record<string, string> = {
	CAR: "Cars",
	SUV: "SUVs",
	VAN: "Vans",
	MOTORCYCLE: "Motorcycles",
	THREE_WHEELER: "Three Wheelers",
	BUS: "Buses",
	LORRY: "Lorries",
	TRACTOR: "Tractors",
	HEAVY_DUTY: "Heavy Duty",
	OTHER: "Others",
};

function getCategoryAccent(value: string) {
	if (value === "CAR") return "from-sky-500 to-cyan-500";
	if (value === "SUV") return "from-amber-500 to-orange-500";
	if (value === "VAN") return "from-violet-500 to-fuchsia-500";
	return "from-emerald-500 to-teal-500";
}

export default async function Home() {
	const [
		featuredListings,
		popularListings,
		latestListing,
		totalListings,
		totalViews,
		activeBrandCount,
		categoryCounts,
	] = await Promise.all([
		prisma.listing.findMany({
			where: { status: "ACTIVE", isFeatured: true },
			include: { images: { orderBy: { order: "asc" }, take: 1 }, brand: true },
			orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }],
			take: 3,
		}),
		prisma.listing.findMany({
			where: { status: "ACTIVE" },
			include: { images: { orderBy: { order: "asc" }, take: 1 }, brand: true },
			orderBy: [{ viewCount: "desc" }, { publishedAt: "desc" }],
			take: 3,
		}),
		prisma.listing.findFirst({
			where: { status: "ACTIVE" },
			include: { images: { orderBy: { order: "asc" }, take: 1 }, brand: true },
			orderBy: { publishedAt: "desc" },
		}),
		prisma.listing.count({ where: { status: "ACTIVE" } }),
		prisma.listing.aggregate({
			where: { status: "ACTIVE" },
			_sum: { viewCount: true },
		}),
		prisma.brand.count({
			where: { listings: { some: { status: "ACTIVE" } } },
		}),
		prisma.listing.groupBy({
			by: ["vehicleType"],
			where: { status: "ACTIVE" },
			_count: { _all: true },
		}),
	]);

	const categories = Object.entries(vehicleTypeLabels)
		.map(([value, label]) => {
			const match = categoryCounts.find((item) => item.vehicleType === value);
			return {
				name: label,
				count: `${match?._count?._all ?? 0} listings`,
				value,
			};
		})
		.filter((category) => category.count !== "0 listings")
		.slice(0, 4);

	const featured = featuredListings.length > 0 ? featuredListings : popularListings;
	const popular = popularListings.length > 0 ? popularListings : featuredListings;

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			<section className="relative overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_30%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#1e293b_100%)] text-white">
				<div className="absolute inset-0 opacity-20">
					<div className="absolute -left-20 top-16 h-80 w-80 rounded-full bg-cyan-400 blur-3xl" />
					<div className="absolute right-0 top-20 h-96 w-96 rounded-full bg-blue-500 blur-3xl" />
				</div>

				<div className="relative mx-auto max-w-7xl px-4 pb-20 pt-16 sm:px-6 lg:px-8">
					<div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
						<div>
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-sky-100 backdrop-blur-sm">
								<span className="h-2 w-2 rounded-full bg-emerald-400" />
								Live marketplace in Sri Lanka
							</div>

							<h1 className="max-w-xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
								Find your next ride with confidence.
							</h1>

							<p className="mt-6 max-w-xl text-lg text-slate-200">
								Discover real listings from verified sellers across Sri Lanka — from
								city cars to premium SUVs.
							</p>

							<div className="mt-8 flex flex-col gap-4 sm:flex-row">
								<Link
									href="/vehicles"
									className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-sky-500/30 transition hover:bg-sky-400"
								>
									Browse vehicles
								</Link>
								<Link
									href="/sell"
									className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/5 px-6 py-3 text-base font-semibold text-white transition hover:bg-white/10"
								>
									Sell your car
								</Link>
							</div>

							<div className="mt-10 flex flex-wrap gap-8 text-sm text-slate-200">
								<div>
									<div className="text-2xl font-bold text-white">
										{totalListings}
									</div>
									<div>Active listings</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-white">
										{activeBrandCount}
									</div>
									<div>Brands available</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-white">
										{(totalViews._sum.viewCount ?? 0).toLocaleString()}
									</div>
									<div>Total views</div>
								</div>
							</div>
						</div>

						<div className="relative">
							<div className="rounded-4xl border border-white/10 bg-white/5 p-4 shadow-2xl shadow-slate-950/30 backdrop-blur-xl">
								<div className="rounded-3xl bg-linear-to-br from-slate-100 to-slate-200 p-5 text-slate-900">
									<div className="mb-6 flex items-center justify-between text-sm font-medium text-slate-600">
										<span>Latest active ad</span>
										<span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-semibold text-emerald-700">
											Live
										</span>
									</div>

									{latestListing ? (
										<div className="rounded-2xl bg-linear-to-br from-slate-900 via-slate-800 to-slate-700 p-5 text-white">
											<div className="mb-4 flex items-center justify-between">
												<span className="text-xs uppercase tracking-[0.2em] text-slate-300">
													AutoLanka
												</span>
												<span className="text-xs font-semibold text-amber-300">
													{latestListing.year}
												</span>
											</div>

											<div className="relative mb-8 h-32 overflow-hidden rounded-2xl bg-slate-200">
												{latestListing.images[0] ? (
													<Image
														src={latestListing.images[0].url}
														alt={latestListing.title}
														fill
														sizes="(max-width: 768px) 100vw, 50vw"
														className="object-cover"
													/>
												) : (
													<div className="flex h-full items-center justify-center text-sm text-slate-500">
														No image
													</div>
												)}
											</div>

											<div className="flex items-end justify-between gap-4">
												<div>
													<div className="text-2xl font-bold">
														{latestListing.brand.name}
													</div>
													<div className="text-sm text-slate-300">
														{latestListing.title}
													</div>
												</div>
												<div className="text-right">
													<div className="text-xl font-bold">
														{formatPrice(latestListing.price)}
													</div>
													<div className="text-xs text-slate-300">
														{latestListing.city}
													</div>
												</div>
											</div>
										</div>
									) : (
										<div className="rounded-2xl bg-slate-200 p-5 text-center text-slate-600">
											No active listings yet.
										</div>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
					{categories.map((category) => (
						<div
							key={category.value}
							className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div
								className={`mb-4 h-12 w-12 rounded-2xl bg-linear-to-br ${getCategoryAccent(
									category.value
								)}`}
							/>
							<div className="text-xl font-bold text-slate-900">
								{category.name}
							</div>
							<div className="mt-1 text-sm text-slate-500">
								{category.count}
							</div>
						</div>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-end justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
							Featured
						</p>
						<h2 className="mt-2 text-3xl font-bold text-slate-900">
							Featured vehicles
						</h2>
					</div>
					<Link
						href="/vehicles"
						className="text-sm font-semibold text-sky-600 hover:text-sky-700"
					>
						View all vehicles →
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{featured.map((listing) => (
						<article
							key={listing.id}
							className="overflow-hidden rounded-4xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
						>
							<div className="relative h-52 overflow-hidden bg-slate-200">
								{listing.images[0] ? (
									<Image
										src={listing.images[0].url}
										alt={listing.title}
										fill
										sizes="(max-width: 768px) 100vw, 33vw"
										className="object-cover"
									/>
								) : (
									<div className="flex h-full items-center justify-center text-slate-500">
										No image
									</div>
								)}
								<div className="absolute inset-x-4 top-4 flex items-center justify-between">
									<span className="rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white">
										{listing.vehicleType}
									</span>
									<span className="text-sm font-semibold text-white">
										{formatPrice(listing.price)}
									</span>
								</div>
							</div>

							<div className="p-5">
								<h3 className="text-xl font-bold text-slate-900">
									{listing.title}
								</h3>
								<p className="mt-2 text-sm text-slate-500">
									{listing.year} •{" "}
									{listing.mileage
										? `${listing.mileage.toLocaleString()} km`
										: "Mileage not listed"}{" "}
									• {listing.city}
								</p>

								<div className="mt-5 flex items-center justify-between">
									<Link
										href={`/vehicles/${listing.slug}`}
										className="rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-700"
									>
										View details
									</Link>
									<span className="text-sm font-medium text-slate-500">
										{listing.brand.name}
									</span>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-end justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-sky-600">
							Popular
						</p>
						<h2 className="mt-2 text-3xl font-bold text-slate-900">
							Popular vehicles
						</h2>
					</div>
					<Link
						href="/vehicles"
						className="text-sm font-semibold text-sky-600 hover:text-sky-700"
					>
						Explore more →
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{popular.map((listing) => (
						<article
							key={`popular-${listing.id}`}
							className="rounded-4xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="flex gap-4">
								<div className="relative h-24 w-32 overflow-hidden rounded-2xl bg-slate-200">
									{listing.images[0] ? (
										<Image
											src={listing.images[0].url}
											alt={listing.title}
											fill
											sizes="(max-width: 768px) 100vw, 20vw"
											className="object-cover"
										/>
									) : (
										<div className="flex h-full items-center justify-center text-xs text-slate-500">
											No image
										</div>
									)}
								</div>

								<div className="min-w-0 flex-1">
									<div className="flex items-start justify-between gap-2">
										<h3 className="truncate text-lg font-bold text-slate-900">
											{listing.title}
										</h3>
										<span className="text-sm font-semibold text-sky-600">
											{listing.viewCount} views
										</span>
									</div>
									<p className="mt-1 text-sm text-slate-500">
										{listing.brand.name} • {listing.city}
									</p>
									<p className="mt-2 text-lg font-bold text-slate-900">
										{formatPrice(listing.price)}
									</p>
									<Link
										href={`/vehicles/${listing.slug}`}
										className="mt-3 inline-block text-sm font-semibold text-sky-600"
									>
										View listing →
									</Link>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>
		</div>
	);
}
