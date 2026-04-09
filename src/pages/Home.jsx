import { Header } from "../components/HomeSection/Header"
import { Hero } from "../components/HomeSection/hero"
import { Service } from "../components/HomeSection/service"
import { About } from "../components/HomeSection/about"
import { Contact } from "../components/HomeSection/contact"
import { Footer } from "../components/HomeSection/footer"

export const Home = () => {
  return (
    <>
      <Header />
      <Hero />
      <Service />
      <About />
      <Contact />
      <Footer />
    </>
  )
}
