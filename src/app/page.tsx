import Image from "next/image";
import Link from "next/link";
import { Bike, Bus, Car, Package, Truck } from "lucide-react";
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

const vehicleTypeIcons: Record<string, typeof Car> = {
	CAR: Car,
	SUV: Car,
	VAN: Truck,
	MOTORCYCLE: Bike,
	THREE_WHEELER: Bike,
	BUS: Bus,
	LORRY: Truck,
	TRACTOR: Truck,
	HEAVY_DUTY: Truck,
	OTHER: Package,
};

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
				count: match?._count?._all ?? 0,
				value,
			};
		})
		.filter((category) => category.count > 0)
		.slice(0, 4);

	const featured = featuredListings.length > 0 ? featuredListings : popularListings;
	const popular = popularListings.length > 0 ? popularListings : featuredListings;

	return (
		<div className="min-h-screen bg-slate-50 text-slate-900">
			{/* HERO */}
			<section className="relative overflow-hidden bg-[#0B2036] text-white">
				{/* soft brand-orange glow kept behind the headline only, away from the card on the right,
				    so it never bleeds a color cast into the translucent card next to it */}
				<div className="pointer-events-none absolute -left-40 -top-40 h-[30rem] w-[30rem] rounded-full bg-orange-500/15 blur-[110px]" />

				{/* road motif tying back to the logo: a dashed line receding toward a horizon */}
				<svg
					className="pointer-events-none absolute inset-x-0 bottom-0 h-28 w-full opacity-30 sm:h-40"
					viewBox="0 0 1200 200"
					preserveAspectRatio="none"
					fill="none"
				>
					<path d="M600 0 L1020 200 L900 200 L600 60 L300 200 L180 200 Z" fill="#F97316" fillOpacity="0.08" />
					<line x1="600" y1="30" x2="600" y2="200" stroke="#F97316" strokeWidth="3" strokeDasharray="18 16" strokeOpacity="0.35" />
				</svg>

				<div className="relative mx-auto max-w-7xl px-4 pb-16 pt-12 sm:px-6 sm:pb-24 sm:pt-16 lg:px-8">
					<div className="grid items-center gap-12 lg:grid-cols-[1.15fr_0.85fr]">
						<div>
							<div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-sm text-slate-200 backdrop-blur-sm">
								<span className="h-2 w-2 rounded-full bg-emerald-400" />
								Live marketplace in Sri Lanka
							</div>

							<h1 className="max-w-xl text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
								Find your next ride,{" "}
								<span className="text-orange-400">anywhere in Sri Lanka.</span>
							</h1>

							<p className="mt-6 max-w-lg text-lg text-slate-300">
								Buy and sell vehicles directly with verified sellers — from city
								runabouts to premium SUVs, no middlemen.
							</p>

							<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4">
								<Link
									href="/vehicles"
									className="inline-flex items-center justify-center rounded-full bg-orange-500 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-400"
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

							<div className="mt-10 flex flex-wrap gap-x-6 gap-y-4 border-t border-white/10 pt-8 text-sm text-slate-300 sm:gap-x-8">
								<div>
									<div className="text-2xl font-bold text-white">{totalListings}</div>
									<div>Active listings</div>
								</div>
								<div>
									<div className="text-2xl font-bold text-white">{activeBrandCount}</div>
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

						<div className="relative mt-2 lg:mt-0">
							<div className="rounded-3xl border border-white/10 bg-[#12283f] p-4 shadow-2xl shadow-black/40">
								<div className="mb-4 flex items-center justify-between px-1 text-sm font-medium text-slate-300">
									<span>Latest active ad</span>
									<span className="flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
										<span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
										Live
									</span>
								</div>

								{latestListing ? (
									<div className="overflow-hidden rounded-2xl bg-[#0F2D4A]">
										<div className="relative h-40 bg-slate-800">
											{latestListing.images[0] ? (
												<Image
													src={latestListing.images[0].url}
													alt={latestListing.title}
													fill
													sizes="(max-width: 768px) 100vw, 50vw"
													className="object-cover"
												/>
											) : (
												<div className="flex h-full items-center justify-center text-sm text-slate-400">
													No image
												</div>
											)}
											<span className="absolute right-3 top-3 rounded-full bg-black/50 px-2 py-1 text-xs font-semibold text-orange-300">
												{latestListing.year}
											</span>
										</div>

										<div className="flex items-end justify-between gap-4 p-5">
											<div className="min-w-0">
												<div className="truncate text-lg font-bold text-white">
													{latestListing.brand.name} {latestListing.title}
												</div>
												<div className="text-sm text-slate-400">{latestListing.city}</div>
											</div>
											<div className="shrink-0 text-right text-xl font-bold text-orange-400">
												{formatPrice(latestListing.price)}
											</div>
										</div>
									</div>
								) : (
									<div className="rounded-2xl bg-white/5 p-8 text-center text-slate-400">
										No active listings yet.
									</div>
								)}
							</div>
						</div>
					</div>
				</div>
			</section>

			{/* CATEGORIES */}
			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<h2 className="mb-8 text-2xl font-bold text-slate-900">Browse by category</h2>
				<div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
					{categories.map((category) => {
						const Icon = vehicleTypeIcons[category.value] ?? Package;
						return (
							<Link
								key={category.value}
								href={`/vehicles?type=${category.value}`}
								className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-orange-200 hover:shadow-md"
							>
								<div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#0F2D4A] transition group-hover:bg-orange-500">
									<Icon className="h-6 w-6 text-white" strokeWidth={1.75} />
								</div>
								<div>
									<div className="font-bold text-slate-900">{category.name}</div>
									<div className="text-sm text-slate-500">{category.count} listings</div>
								</div>
							</Link>
						);
					})}
				</div>
			</section>

			{/* FEATURED */}
			<section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-end justify-between">
					<h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Featured vehicles</h2>
					<Link href="/vehicles" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
						View all vehicles →
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{featured.map((listing) => (
						<article
							key={listing.id}
							className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
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
									<span className="rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white">
										{vehicleTypeLabels[listing.vehicleType] ?? listing.vehicleType}
									</span>
									<span className="rounded-full bg-orange-500 px-2.5 py-1 text-xs font-bold text-white">
										{formatPrice(listing.price)}
									</span>
								</div>
							</div>

							<div className="p-5">
								<h3 className="text-lg font-bold text-slate-900">{listing.title}</h3>
								<p className="mt-1.5 text-sm text-slate-500">
									{listing.year} •{" "}
									{listing.mileage ? `${listing.mileage.toLocaleString()} km` : "Mileage not listed"} •{" "}
									{listing.city}
								</p>

								<div className="mt-5 flex items-center justify-between">
									<Link
										href={`/vehicles/${listing.slug}`}
										className="rounded-full bg-[#0F2D4A] px-4 py-2 text-sm font-medium text-white transition hover:bg-[#163a5f]"
									>
										View details
									</Link>
									<span className="text-sm font-medium text-slate-500">{listing.brand.name}</span>
								</div>
							</div>
						</article>
					))}
				</div>
			</section>

			{/* POPULAR */}
			<section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
				<div className="mb-8 flex items-end justify-between">
					<h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Popular vehicles</h2>
					<Link href="/vehicles" className="text-sm font-semibold text-orange-600 hover:text-orange-700">
						Explore more →
					</Link>
				</div>

				<div className="grid gap-6 lg:grid-cols-3">
					{popular.map((listing) => (
						<article
							key={`popular-${listing.id}`}
							className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
						>
							<div className="flex gap-4">
								<div className="relative h-24 w-32 shrink-0 overflow-hidden rounded-2xl bg-slate-200">
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
										<h3 className="truncate text-lg font-bold text-slate-900">{listing.title}</h3>
										<span className="shrink-0 text-sm font-semibold text-orange-600">
											{listing.viewCount} views
										</span>
									</div>
									<p className="mt-1 text-sm text-slate-500">
										{listing.brand.name} • {listing.city}
									</p>
									<p className="mt-2 text-lg font-bold text-slate-900">{formatPrice(listing.price)}</p>
									<Link
										href={`/vehicles/${listing.slug}`}
										className="mt-3 inline-block text-sm font-semibold text-orange-600 hover:text-orange-700"
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