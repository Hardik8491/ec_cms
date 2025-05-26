import { ComponentLoader } from "adminjs"

export const componentLoader = new ComponentLoader()

// Register custom components
componentLoader.register("Dashboard", "./components/dashboard")
componentLoader.register("ImagesList", "./components/images-list")
componentLoader.register("ImagesShow", "./components/images-show")
componentLoader.register("ImagesEdit", "./components/images-edit")
componentLoader.register("JsonView", "./components/json-view")
componentLoader.register("JsonEdit", "./components/json-edit")
