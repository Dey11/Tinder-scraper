import { SearchForm } from "@/components/search/SearchForm";

export default function Home() {
  return (
    <main className="min-h-dvh bg-gradient-to-br from-orange-300 to-rose-300">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-rose-500 text-shadow-lg sm:text-5xl md:text-6xl">
            Find Tinder Profiles
          </h1>
          <p className="mx-auto mt-3 max-w-md text-base font-semibold text-gray-600 text-shadow-2xs sm:text-lg md:mt-5 md:max-w-3xl md:text-xl">
            Search for profiles by name, age, location and photo similarity
          </p>
        </div>

        <div className="mx-auto mt-10 max-w-2xl rounded-xl bg-rose-100 p-6 shadow-xl shadow-rose-300 transition-all duration-150 hover:shadow-rose-400/20 md:p-10">
          <SearchForm />
        </div>

        <div className="mt-12 text-center text-sm text-gray-500">
          <p>Search results typically take about 10 minutes to complete.</p>
          <p className="mt-1">
            The system will scrape profiles based on your search criteria.
          </p>
        </div>
      </div>
    </main>
  );
}
