// import Hero from '../components/Hero';
import { Link } from 'react-router-dom';

const HomeScreen = () => {
    return (
        <>
            <div className="relative">
                <header className="fixed flex justify-between items-center w-full px-8 pt-3">
                    <h1 className="font-black text-2xl">
                        <Link to="/">Frends!</Link>
                    </h1>
                    <nav>
                        <ul className="flex flex-row font-semibold gap-3 md:gap-8 mt-1">
                            <li><a href="#" className="hover:opacity-50 transition ease-in duration-400">Find Friends</a></li>
                            <li><Link to="/login" className="hover:opacity-50 transition ease-in duration-400">Sign In</Link></li>
                            <li><Link to="/register" className="hover:opacity-50 transition ease-in duration-400">Sign Up</Link></li>
                            </ul>
                    </nav>
                </header>
                <main className="md:grid md:grid-cols-2">
                    <section className="min-h-screen bg-yellow-400 flex flex-col justify-between pt-28 md:pt-20 pb-16 px-8">
                        <h2 className="font-black text-4xl w-3/4"><span className="text-5xl">Frends!</span> is your<span className="text-yellow-900"> #1</span> spot to connect with friends.</h2>

                        <div className="flex flex-row justify-around w-3/4">
                            <a href="#" className="bg-black hover:bg-gray-300 text-white hover:text-black transition ease-in duration-500 py-3 px-6 uppercase text-xs tracking-[0.2em] font-black rounded cursor-pointer">Find Friends</a>
                            <Link to="/login" className="bg-black hover:bg-gray-300 text-white hover:text-black transition ease-in duration-500 py-3 px-6 uppercase text-xs tracking-[0.2em] font-black rounded cursor-pointer">Sign In</Link>
                        </div>

                        <p className="text-lg">
                            Reconnect with old friends like you never lost touch.
                            <br />
                            Keep in touch with your current friends.
                        </p>

                        <footer className="">
                            <span className="text-xs font-light hidden md:block">&copy; 2023 Frends!</span>
                        </footer>
                    </section>

                    <section className="min-h-screen py-10 flex flex-col items-center justify-center gap-1">
                        <article className="bg-red-100 text-sm w-3/4 mx-auto flex gap-3 items-center px-2 py-1 rounded">
                            <div className="">
                                <img src="../dist/images/sandro-g-photography-yWqCp8cKDWc-unsplash.jpg" alt="" className="w-14 h-14 object-cover rounded border-solid border-2 border-white" loading="lazy" />
                            </div>
                            <div className="flex flex-col gap-0 self-center text-xs">
                                <q>I found my friend, Max on Frends. We quickly reconnected like we never lost touch!</q>
                                <cite className="font-bold self-end">— Bill Gates</cite>
                            </div>
                        </article>
                        <article className="bg-purple-100 text-sm w-3/4 mx-auto flex gap-3 items-center px-2 py-1 rounded -ml-2">
                            <div className="">
                                <img src="../dist/images/sandro-g-photography-yWqCp8cKDWc-unsplash.jpg" alt="" className="w-14 h-14 object-cover rounded border-solid border-2 border-white" loading="lazy" />
                            </div>
                            <div className="flex flex-col gap-0 self-center text-xs">
                                <q>I found my friend, Max on Frends. We quickly reconnected like we never lost touch!</q>
                                <cite className="font-bold self-end">— Bill Gates</cite>
                            </div>
                        </article>
                        <article className="bg-stone-200 text-sm w-3/4 mx-auto flex gap-3 items-center px-2 py-1 rounded mr-1">
                            <div className="">
                                <img src="../dist/images/sandro-g-photography-yWqCp8cKDWc-unsplash.jpg" alt="" className="w-14 h-14 object-cover rounded border-solid border-2 border-white" loading="lazy" />
                            </div>
                            <div className="flex flex-col gap-0 self-center text-xs">
                                <q>I found my friend, Max on Frends. We quickly reconnected like we never lost touch!</q>
                                <cite className="font-bold self-end">— Bill Gates</cite>
                            </div>
                        </article>
                        <article className="bg-orange-200 text-sm w-3/4 mx-auto flex gap-3 items-center px-2 py-1 rounded -ml-[0.05rem]">
                            <div className="">
                                <img src="../dist/images/sandro-g-photography-yWqCp8cKDWc-unsplash.jpg" alt="" className="w-14 h-14 object-cover rounded border-solid border-2 border-white" loading="lazy" />
                            </div>
                            <div className="flex flex-col gap-0 self-center text-xs">
                                <q>I found my friend, Max on Frends. We quickly reconnected like we never lost touch!</q>
                                <cite className="font-bold self-end">— Bill Gates</cite>
                            </div>
                        </article>
                        <article className="bg-sky-100 text-sm w-3/4 mx-auto flex gap-3 items-center px-2 py-1 rounded">
                            <div className="">
                                <img src="../dist/images/sandro-g-photography-yWqCp8cKDWc-unsplash.jpg" alt="" className="w-14 h-14 object-cover rounded border-solid border-2 border-white" loading="lazy" />
                            </div>
                            <div className="flex flex-col gap-0 self-center text-xs">
                                <q>I found my friend, Max on Frends. We quickly reconnected like we never lost touch!</q>
                                <cite className="font-bold self-end">— Bill Gates</cite>
                            </div>
                        </article>
                    </section>
                </main>

                <footer className="w-full px-8 mb-6 md:mb-0">
                    <span className="text-xs font-light block md:hidden">&copy; 2023 Frends!</span>
                </footer>
            </div>
        </>
    );
};

export default HomeScreen;