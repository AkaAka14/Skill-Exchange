def rank_matches(matches):
    return sorted(matches, key=lambda x: x.get("confidence", 0), reverse=True)