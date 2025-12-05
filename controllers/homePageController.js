const homePageService = require("../services/homePageService");

const truncate = (str, length) => {
  if (!str || str.length <= length) {
    return str || ""; // Return empty string if input is null/undefined
  }
  return str.substring(0, length) + "...";
};

exports.getHeroSlides = async (req, res) => {
  try {
    // 1. Get RAW data from service
    const rawSlides = await homePageService.fetchHeroSlides();

    // 2. Process the data (the "smart" part)
    const processedSlides = rawSlides.map((slide) => {
      const linkedItem = slide.car || slide.event;

      let assetUrl = slide.customAssetUrl;
      let mobileAssetUrl = slide.customMobileAssetUrl;
      let assetType = slide.customAssetType;

      if (!assetUrl) {
        if (linkedItem?.promoVideoUrl) {
          assetUrl = linkedItem.promoVideoUrl;
          assetType = "VIDEO";
        } else {
          assetUrl =
            linkedItem?.thumbnail ||
            linkedItem?.primaryImage ||
            "/images/default-hero.jpg";
          assetType = "IMAGE";
          mobileAssetUrl = linkedItem?.mobileThumbnail;
        }
      }
      if (!mobileAssetUrl) {
        mobileAssetUrl = assetUrl;
      }

      const linkUrl =
        slide.customLinkUrl ??
        (slide.car && slide.car.id
          ? `/cars/${slide.car.id}`
          : slide.event && slide.event.slug
          ? `/events/${slide.event.slug}`
          : "/");

      return {
        id: slide.id,
        title: slide.customTitle ?? linkedItem?.title ?? "Untitled Slide",
        subtitle:
          slide.customSubtitle ?? truncate(linkedItem?.description, 100),
        linkUrl: linkUrl,
        assetUrl: assetUrl,
        mobileAssetUrl: mobileAssetUrl,
        assetType: assetType,
      };
    });

    res.set("Cache-Control", "public, max-age=300, stale-while-revalidate=600");

    // 3. Send the PROCESSED data
    res.status(200).json({
      success: true,
      message: "Hero slides fetched successfully",
      data: processedSlides,
    });
  } catch (error) {
    console.error("Error in getHeroSlides controller:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch hero slides." });
  }
};
